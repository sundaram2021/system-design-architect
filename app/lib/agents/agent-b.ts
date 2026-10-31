import { generateWithHaiku } from "../services/ai-service";
import { parseJsonSafely } from "../services/json-parser";
import { AGENT_B_SYSTEM_PROMPT } from "./prompts";
import {
  AgentBResponseSchema,
  type AgentBResponse,
  type AgentAResearchResult
} from "../schemas/agent-responses";
import {
  type ConversationContext,
  buildConversationHistory,
  countQuestionsInConversation
} from "./agent-b-context";

const MAX_RESEARCH_ATTEMPTS = 2;

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
      instruction: "You have received VALIDATOR FEEDBACK. Do NOT ask questions. Fix the plan immediately based on the feedback and generate an updated plan.",
      validFormats: "plan"
    };
  }
  if (researchExhausted) {
    return {
      instruction: "You have reached the maximum number of research rounds. You MUST generate the architectural plan NOW using the research data. Do NOT request more research.",
      validFormats: "plan"
    };
  }
  if (hasResearch) {
    return {
      instruction: "You have research data. Generate the comprehensive architectural plan using the research recommendations. Do NOT ask more questions or request additional research.",
      validFormats: "plan"
    };
  }
  if (questionCount >= maxQuestions) {
    return {
      instruction: "You have asked the maximum number of questions. Now request research for technology decisions. Return research_needed.",
      validFormats: "out_of_scope, research_needed"
    };
  }
  if (questionCount < minQuestions) {
    const questionsNeeded = minQuestions - questionCount;
    return {
      instruction: `You have asked ${questionCount}/${minQuestions} required questions. You MUST ask ${questionsNeeded} more question(s) before proceeding to research.\nAsk ONE clear question about FUNCTIONAL requirements.\nDO NOT proceed to research until you have asked at least ${minQuestions} questions.`,
      validFormats: "out_of_scope, question"
    };
  }
  return {
    instruction: `You have asked ${questionCount} questions (${minQuestions} minimum required, ${maxQuestions} maximum). If you have enough context, proceed to research_needed. Otherwise, ask ONE more functional question.`,
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
    hasFeedback,
    hasResearch,
    researchExhausted,
    questionCount,
    phase
  );

  const prompt = `## CONVERSATION HISTORY\n${conversationHistory}\n\n## CURRENT USER MESSAGE\n${userMessage}\n\n## INSTRUCTION\n${instruction}\n\nRemember: You MUST respond with valid JSON. Valid response types: ${validFormats}.`;

  const response = await generateWithHaiku(AGENT_B_SYSTEM_PROMPT, prompt, { temperature: 0.7 });
  const parsed = parseJsonSafely<AgentBResponse>(response, AgentBResponseSchema);

  if (parsed.success) {
    return parsed.data;
  }

  // Fallback retry with corrective instruction
  try {
    const retryPrompt = `${prompt}\n\n## CRITICAL: Your previous response was invalid. Respond ONLY with valid JSON conforming to: ${validFormats}.`;
    const retryResponse = await generateWithHaiku(AGENT_B_SYSTEM_PROMPT, retryPrompt, { temperature: 0.5 });
    const retryParsed = parseJsonSafely<AgentBResponse>(retryResponse, AgentBResponseSchema);
    if (retryParsed.success) {
      return retryParsed.data;
    }
  } catch (err) {
    console.error("Agent-B retry attempt failed:", err);
  }

  if (hasResearch || researchExhausted) {
    return {
      type: "thinking",
      data: { status: "The architect encountered an issue formulating the plan. Please rephrase your request." }
    };
  }

  return {
    type: "research_needed",
    data: {
      query: `best technology stack for ${userMessage}`,
      context: userMessage,
      purpose: "technology_selection"
    }
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
  return orchestrate("Research completed. Generate the architectural plan now using the research data.", updatedContext, phase);
}

export async function requestPlanEdit(
  editRequest: string,
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  return orchestrate(`Please update the plan with these changes: ${editRequest}`, context, phase);
}
