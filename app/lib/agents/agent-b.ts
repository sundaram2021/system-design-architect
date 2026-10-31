import { generateWithHaiku } from "../services/ai-service";
import { parseJsonSafely } from "../services/json-parser";
import { AGENT_B_SYSTEM_PROMPT } from "./prompts";
import {
  AgentBResponseSchema,
  type AgentBResponse,
  type AgentBPlanResponse,
  type AgentAResearchResult
} from "../schemas/agent-responses";
import {
  type ConversationContext,
  buildConversationHistory,
  countQuestionsInConversation
} from "./agent-b-context";

const MAX_RESEARCH_ATTEMPTS = 2;
const VALID_TYPES = new Set([
  "frontend", "backend", "database", "cache", "queue", "gateway", "service", "external"
]);

function sanitizePlan(planData: AgentBPlanResponse["data"]): AgentBPlanResponse["data"] {
  const componentMap = new Map<string, string>();

  const sanitizedComponents = planData.components.map((c, i) => {
    const id = c.id || `comp_${i + 1}`;
    componentMap.set(id, id);
    const type = VALID_TYPES.has(c.type) ? c.type : "service";
    return {
      id,
      name: c.name || `Service ${i + 1}`,
      type: type as AgentBPlanResponse["data"]["components"][number]["type"],
      description: c.description || "",
      technologies: Array.isArray(c.technologies) && c.technologies.length > 0 ? c.technologies : ["Standard Stack"],
      connections: Array.isArray(c.connections) ? c.connections : []
    };
  });

  const validIds = new Set(sanitizedComponents.map((c) => c.id));
  const fallbackId = sanitizedComponents[0]?.id || "comp_1";

  const sanitizedDataFlow = (planData.dataFlow || []).map((df) => ({
    from: validIds.has(df.from) ? df.from : fallbackId,
    to: validIds.has(df.to) ? df.to : fallbackId,
    description: (df.description || "Connection").substring(0, 30)
  }));

  return {
    title: planData.title || "System Architecture",
    summary: planData.summary || "Realistic and maintainable system design.",
    components: sanitizedComponents,
    dataFlow: sanitizedDataFlow
  };
}

function getOrchestrationInstruction(
  hasFeedback: boolean,
  hasResearch: boolean,
  researchExhausted: boolean,
  questionCount: number,
  phase: "initial_design" | "follow_up"
): { instruction: string; validFormats: string } {
  const minQuestions = phase === "initial_design" ? 4 : 1;
  const maxQuestions = 5;

  if (hasFeedback && hasResearch) {
    return {
      instruction: "You received VALIDATOR FEEDBACK. Do not overcomplicate. Address the feedback with realistic, simple changes and generate the plan.",
      validFormats: "plan"
    };
  }
  if (researchExhausted || hasResearch) {
    return {
      instruction: "Generate a realistic, practical architectural plan (3-6 core components). Do NOT over-engineer.",
      validFormats: "plan"
    };
  }
  if (questionCount >= maxQuestions) {
    return {
      instruction: "Maximum questions asked. Request realistic technology research. Return research_needed.",
      validFormats: "out_of_scope, research_needed"
    };
  }
  if (questionCount < minQuestions) {
    return {
      instruction: `Ask ONE clear question about FUNCTIONAL requirements (${questionCount}/${minQuestions} asked).`,
      validFormats: "out_of_scope, question"
    };
  }
  return {
    instruction: "Either ask ONE more functional question or proceed to research_needed if context is sufficient.",
    validFormats: "out_of_scope, question, research_needed"
  };
}

export async function orchestrate(
  userMessage: string,
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  const conversationHistory = buildConversationHistory(context);
  const questionCount = countQuestionsInConversation(context.messages);
  const hasResearch = Boolean(context.researchResults && context.researchResults.length > 0);
  const hasFeedback = context.messages.some((m) => m.type === "system" && m.content.includes("FEEDBACK"));
  const researchAttempts = context.researchAttemptCount ?? 0;
  const researchExhausted = researchAttempts >= MAX_RESEARCH_ATTEMPTS;

  const { instruction, validFormats } = getOrchestrationInstruction(
    hasFeedback, hasResearch, researchExhausted, questionCount, phase
  );

  const prompt = `## CONVERSATION HISTORY\n${conversationHistory}\n\n## CURRENT USER MESSAGE\n${userMessage}\n\n## INSTRUCTION\n${instruction}\n\nRemember: Valid JSON format. Valid types: ${validFormats}.`;

  const response = await generateWithHaiku(AGENT_B_SYSTEM_PROMPT, prompt, { temperature: 0.5 });
  const parsed = parseJsonSafely<AgentBResponse>(response, AgentBResponseSchema);

  if (parsed.success) {
    if (parsed.data.type === "plan") {
      return { type: "plan", data: sanitizePlan(parsed.data.data) };
    }
    return parsed.data;
  }

  // Fallback retry with corrective instruction
  try {
    const retryPrompt = `${prompt}\n\nCRITICAL: Respond ONLY with valid JSON conforming to: ${validFormats}.`;
    const retryResponse = await generateWithHaiku(AGENT_B_SYSTEM_PROMPT, retryPrompt, { temperature: 0.2 });
    const retryParsed = parseJsonSafely<AgentBResponse>(retryResponse, AgentBResponseSchema);
    if (retryParsed.success) {
      if (retryParsed.data.type === "plan") {
        return { type: "plan", data: sanitizePlan(retryParsed.data.data) };
      }
      return retryParsed.data;
    }
  } catch (err) {
    console.error("Agent-B retry attempt failed:", err);
  }

  if (hasResearch || researchExhausted) {
    return {
      type: "thinking",
      data: { status: "Formulating a practical architectural plan..." }
    };
  }

  return {
    type: "research_needed",
    data: { query: `best practical tech stack for ${userMessage}`, context: userMessage, purpose: "technology_selection" }
  };
}

export async function processUserAnswer(
  questionId: string,
  answer: string | string[],
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  const answerText = Array.isArray(answer) ? answer.join(", ") : answer;
  const updatedContext: ConversationContext = {
    ...context,
    questionAnswers: [...(context.questionAnswers || []), { questionId, answer }]
  };
  return orchestrate(`My answer: ${answerText}`, updatedContext, phase);
}

export async function processResearchResults(
  researchResults: AgentAResearchResult[],
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  const updatedContext: ConversationContext = {
    ...context,
    researchResults: [...(context.researchResults || []), ...researchResults],
    researchAttemptCount: (context.researchAttemptCount ?? 0) + 1
  };
  return orchestrate("Research completed. Generate a realistic, uncomplicated architectural plan now.", updatedContext, phase);
}

export async function requestPlanEdit(
  editRequest: string,
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  return orchestrate(`Please update the plan with these realistic changes: ${editRequest}`, context, phase);
}
