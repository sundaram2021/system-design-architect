import { generateWithGemini } from "../services/gemini-service";
import { AGENT_B_SYSTEM_PROMPT } from "./prompts";
import { 
  AgentBResponseSchema, 
  type AgentBResponse,
  type Message,
  type AgentAResearchResult
} from "../schemas";

interface ConversationContext {
  messages: Message[];
  researchResults?: AgentAResearchResult[];
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
  context: ConversationContext
): Promise<AgentBResponse> {
  const conversationHistory = buildConversationHistory(context);
  const questionCount = countQuestionsInConversation(context.messages);
  const hasResearch = context.researchResults && context.researchResults.length > 0;
  const hasFeedback = context.messages.some(m => m.type === "system" && m.content.includes("FEEDBACK"));

  let instruction = "";
  
  // If we have validator feedback, skip questions entirely and fix the plan
  if (hasFeedback && hasResearch) {
    instruction = "You have received VALIDATOR FEEDBACK. Do NOT ask questions. Fix the plan immediately based on the feedback and generate an updated plan.";
  } else if (hasResearch) {
    // We have research data - generate the plan
    instruction = "You have research data. NOW generate the comprehensive architectural plan using the research recommendations. Do NOT ask more questions.";
  } else if (questionCount >= 4) {
    // Asked 4 questions already (max limit) - proceed to research
    instruction = "You have asked the maximum number of questions. Now proceed to request research for technology decisions. Return research_needed type.";
  } else if (questionCount >= 1) {
    // Asked at least 1 question - can ask more (up to 4) OR proceed to research
    instruction = `You have asked ${questionCount} question(s). You can either:
1. Ask ONE more relevant follow-up question about functional requirements (max 4 total)
2. OR proceed to request research if you have enough information

Use your judgment - if the user's answers give you enough context, proceed to research_needed. If you need more clarity on features, ask ONE more question.`;
  } else {
    // First message - MUST ask at least 1 question (mandatory)
    instruction = `This is a NEW project request. You MUST ask at least ONE relevant question about FUNCTIONAL REQUIREMENTS before proceeding.

Ask ONE clear question about what the user wants to build. Focus on:
- Core features they need
- Who will use the system
- Key use cases or workflows

Make the question SPECIFIC to their request (e.g., for a "chat app" ask about messaging features, for "e-commerce" ask about product types).
DO NOT skip to research without asking at least one question.`;
  }

  const prompt = `## CONVERSATION HISTORY
${conversationHistory}

## CURRENT USER MESSAGE
${userMessage}

## INSTRUCTION
${instruction}

Remember: You MUST respond with valid JSON in one of the specified formats (question, research_needed, or plan).`;

  const response = await generateWithGemini(
    AGENT_B_SYSTEM_PROMPT,
    prompt,
    { temperature: 0.7 }
  );

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch {
    // Fallback: prefer research over questions
    if (!hasResearch) {
      return {
        type: "research_needed",
        data: {
          query: `best technology stack for ${userMessage}`,
          context: userMessage,
          purpose: "technology_selection"
        }
      };
    }
    // If we have research but parsing failed, return a generic research request
    return {
      type: "research_needed",
      data: {
        query: `architecture best practices for ${userMessage}`,
        context: userMessage,
        purpose: "architecture_patterns"
      }
    };
  }

  const validated = AgentBResponseSchema.safeParse(parsed);
  
  if (!validated.success) {
    console.error("Agent-B response validation failed:", validated.error);
    // Fallback: always prefer research over questions
    return {
      type: "research_needed",
      data: {
        query: `best architecture patterns for ${userMessage}`,
        context: userMessage,
        purpose: "architecture_patterns"
      }
    };
  }

  return validated.data;
}

export async function processUserAnswer(
  questionId: string,
  answer: string | string[],
  context: ConversationContext
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
    updatedContext
  );
}

export async function processResearchResults(
  researchResults: AgentAResearchResult[],
  context: ConversationContext
): Promise<AgentBResponse> {
  const updatedContext: ConversationContext = {
    ...context,
    researchResults: [
      ...(context.researchResults || []),
      ...researchResults
    ]
  };

  return orchestrate(
    "Research completed. Generate the architectural plan now using the research data.",
    updatedContext
  );
}

export async function requestPlanEdit(
  editRequest: string,
  context: ConversationContext
): Promise<AgentBResponse> {
  return orchestrate(
    `Please update the plan with these changes: ${editRequest}`,
    context
  );
}
