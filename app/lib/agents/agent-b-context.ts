import type { Message } from "../schemas/message";
import type { AgentAResearchResult } from "../schemas/agent-responses";

export interface ConversationContext {
  messages: Message[];
  researchResults?: AgentAResearchResult[];
  researchAttemptCount?: number;
  questionAnswers?: { questionId: string; answer: string | string[] }[];
}

export function extractCurrentConversation(messages: Message[]): Message[] {
  const lastUserMessageIndex = messages
    .map((m, i) => ({ m, i }))
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

export function countQuestionsInConversation(messages: Message[]): number {
  const relevantMessages = extractCurrentConversation(messages);
  return relevantMessages.filter((m) => m.type === "question").length;
}

export function buildConversationHistory(context: ConversationContext): string {
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

  parts.push("\n--- STATUS ---");
  parts.push(`Questions asked: ${questionCount}`);
  parts.push(`User answers received: ${userAnswerCount}`);
  parts.push(`Research available: ${context.researchResults && context.researchResults.length > 0 ? "YES" : "NO"}`);

  return parts.join("\n");
}

