import { generateWithGemini } from "../services/ai-service";
import { AGENT_B_SYSTEM_PROMPT } from "./prompts";
import { AgentBResponseSchema, type AgentBResponse, type AgentAResearchResult } from "../schemas/agent-responses";
import type { Message } from "../schemas/message";

const MAX_RESEARCH_ATTEMPTS = 2;

interface ConversationContext {
  messages: Message[];
  researchResults?: AgentAResearchResult[];
  researchAttemptCount?: number;
  questionAnswers?: { questionId: string; answer: string | string[] }[];
}

function extractCurrentConversation(messages: Message[]): Message[] {
  const lastUserMessageIndex = messages.map((m, i) => ({ m, i }))
    .filter(({ m }) => m.type === "user")
    .pop()?.i ?? 0;

  let startIndex = 0;
  for (let i = lastUserMessageIndex - 1; i >= 0; i--) {
    if (messages[i].type === "system" && i === 0) {
      startIndex = 0;
      break;
    }
    if (messages[i].type === "plan" && i < lastUserMessageIndex - 1) {
      startIndex = i + 1;
      break;
    }
  }

  return messages.slice(startIndex);
}

function buildConversationHistory(context: ConversationContext): string {
  const parts: string[] = [];
  const relevantMessages = extractCurrentConversation(context.messages);

  let questionCount = 0;
  let userAnswerCount = 0;

  relevantMessages.forEach((msg) => {
    if (msg.type === "user") {
      parts.push(`User: ${msg.content}`);
      userAnswerCount++;
    } else if (msg.type === "question") {
      parts.push(`Architect asked: ${msg.question}`);
      questionCount++;
    } else if (msg.type === "research") {
      if (msg.summary) {
        parts.push(`Research findings: ${msg.summary}`);
      }
    } else if (msg.type === "system" && msg.content.includes("FEEDBACK")) {
        parts.push(`\n!!! CRITICAL FEEDBACK !!!\n${msg.content}\n`);
    }
  });

  if (context.researchResults && context.researchResults.length > 0) {
    parts.push("\n## RESEARCH DATA (use for technology decisions):");
    context.researchResults.forEach((r, i) => {
      parts.push(`Research ${i + 1}: ${r.summary}`);
      parts.push(`Recommendation: ${r.recommendation}`);
    });
  }

  parts.push(`\n--- STATUS ---`);
  parts.push(`Questions asked: ${questionCount}`);
  parts.push(`User answers received: ${userAnswerCount}`);
  parts.push(`Research available: ${context.researchResults && context.researchResults.length > 0 ? "YES" : "NO"}`);

  return parts.join("\n");
}

function countQuestionsInConversation(messages: Message[]): number {
  const relevantMessages = extractCurrentConversation(messages);
  return relevantMessages.filter(m => m.type === "question").length;
}

export async function orchestrate(
  userMessage: string,
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  const conversationHistory = buildConversationHistory(context);
  const questionCount = countQuestionsInConversation(context.messages);
  const hasResearch = context.researchResults && context.researchResults.length > 0;
  const hasFeedback = context.messages.some(m => m.type === "system" && m.content.includes("FEEDBACK"));
  const researchAttempts = context.researchAttemptCount ?? 0;
  const researchExhausted = researchAttempts >= MAX_RESEARCH_ATTEMPTS;

  let instruction = "";
  let validFormats = "out_of_scope, question, research_needed, plan";
  const minQuestions = phase === "initial_design" ? 4 : 1;
  const maxQuestions = 5;

  if (hasFeedback && hasResearch) {
    instruction = "You have received VALIDATOR FEEDBACK. Do NOT ask questions. Fix the plan immediately based on the feedback and generate an updated plan.";
    validFormats = "plan";
  } else if (researchExhausted) {
    instruction = "You have reached the maximum number of research rounds. You MUST generate the architectural plan NOW using the research data and your expertise. Do NOT request more research.";
    validFormats = "plan";
  } else if (hasResearch) {
    instruction = "You have research data. Generate the comprehensive architectural plan using the research recommendations. Do NOT ask more questions or request additional research.";
    validFormats = "plan";
  } else if (questionCount >= maxQuestions) {
    instruction = "You have asked the maximum number of questions. Now request research for technology decisions. Return research_needed.";
    validFormats = "out_of_scope, research_needed";
  } else if (questionCount < minQuestions) {
    const questionsNeeded = minQuestions - questionCount;
    instruction = `You have asked ${questionCount}/${minQuestions} required questions. You MUST ask ${questionsNeeded} more question(s) before proceeding to research.

Ask ONE clear question about FUNCTIONAL requirements:
- For ${phase === "initial_design" ? "NEW DESIGN" : "FOLLOW-UP"}: focus on ${phase === "initial_design" ? "core features, users, scale, use cases, special requirements" : "what specifically needs to change"}
- Make the question SPECIFIC to their request
- DO NOT proceed to research until you've asked at least ${minQuestions} questions`;
    validFormats = "out_of_scope, question";
  } else {
    instruction = `You have asked ${questionCount} questions (${minQuestions} minimum required, ${maxQuestions} maximum). You can either:
1. Ask ONE more relevant question about functional requirements
2. OR proceed to request research if you have enough information

Use your judgment - if the user's answers give you enough context, proceed to research_needed. If you need more clarity, ask ONE more question.`;
    validFormats = "out_of_scope, question, research_needed";
  }

  const prompt = `## CONVERSATION HISTORY
${conversationHistory}

## CURRENT USER MESSAGE
${userMessage}

## INSTRUCTION
${instruction}

Remember: You MUST respond with valid JSON. Valid response types: ${validFormats}.`;

  const response = await generateWithGemini(
    AGENT_B_SYSTEM_PROMPT,
    prompt,
    { temperature: 0.7 }
  );

  const attemptWithFallback = async (attemptType: "parse" | "schema"): Promise<AgentBResponse> => {
    try {
      const retryPrompt = hasResearch
        ? `## CRITICAL: Your previous response was invalid (${attemptType === "parse" ? "not valid JSON" : "wrong structure"}). Generate a VALID architectural plan NOW using the research data. Respond ONLY with valid JSON in the plan format.`
        : `## CRITICAL: Your previous response was invalid (${attemptType === "parse" ? "not valid JSON" : "wrong structure"}). ${researchExhausted ? "You MUST generate a plan now." : "Respond with valid JSON in one of the valid formats."}`;

      const retryResponse = await generateWithGemini(
        AGENT_B_SYSTEM_PROMPT,
        prompt + `\n\n${retryPrompt}`,
        { temperature: 0.7 }
      );

      const retryParsed = JSON.parse(retryResponse);
      const retryValidated = AgentBResponseSchema.safeParse(retryParsed);
      if (retryValidated.success) {
        return retryValidated.data;
      }
    } catch {
      // retry also failed, fall through to error
    }

    // if we have research, the model is clearly stuck — return an error message
    if (hasResearch || researchExhausted) {
      return {
        type: "thinking",
        data: { status: "The model is having trouble generating a valid plan. Please try rephrasing your request." }
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
  };

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch {
    return attemptWithFallback("parse");
  }

  const validated = AgentBResponseSchema.safeParse(parsed);

  if (!validated.success) {
    console.error("Agent-B response validation failed:", validated.error);
    return attemptWithFallback("schema");
  }

  return validated.data;
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
    questionAnswers: [
      ...(context.questionAnswers || []),
      { questionId, answer }
    ]
  };

  return orchestrate(
    `My answer: ${answerText}`,
    updatedContext,
    phase
  );
}

export async function processResearchResults(
  researchResults: AgentAResearchResult[],
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  const researchAttemptCount = (context.researchAttemptCount ?? 0) + 1;

  const updatedContext: ConversationContext = {
    ...context,
    researchResults: [
      ...(context.researchResults || []),
      ...researchResults
    ],
    researchAttemptCount
  };

  return orchestrate(
    "Research completed. Generate the architectural plan now using the research data.",
    updatedContext,
    phase
  );
}

export async function requestPlanEdit(
  editRequest: string,
  context: ConversationContext,
  phase: "initial_design" | "follow_up" = "initial_design"
): Promise<AgentBResponse> {
  return orchestrate(
    `Please update the plan with these changes: ${editRequest}`,
    context,
    phase
  );
}
