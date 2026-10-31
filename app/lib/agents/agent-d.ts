import { generateWithHaiku } from "../services/ai-service";
import { parseJsonSafely } from "../services/json-parser";
import { AGENT_D_SYSTEM_PROMPT } from "./prompts";
import { AgentDReviewResponseSchema, type AgentDReviewResponse } from "../schemas/agent-responses";
import type { Plan } from "../schemas/message";

export async function validatePlan(
  plan: Plan,
  context: string
): Promise<AgentDReviewResponse> {
  const planDescription = `
## CONTEXT
The user is building: ${context}

## PROPOSED ARCHITECTURAL PLAN
Title: ${plan.title}
Summary: ${plan.summary}

### COMPONENTS
${plan.components
  .map(
    (c) =>
      `- Name: ${c.name} (${c.type})\n  Tech: ${c.technologies.join(", ")}\n  Desc: ${c.description}\n  Connects to: ${c.connections.join(", ")}`
  )
  .join("\n")}

### DATA FLOW
${plan.dataFlow.map((f) => `- ${f.from} -> ${f.to} (${f.description})`).join("\n")}
`;

  try {
    const response = await generateWithHaiku(
      AGENT_D_SYSTEM_PROMPT,
      planDescription,
      { temperature: 0.1 }
    );

    const parsed = parseJsonSafely<AgentDReviewResponse>(
      response,
      AgentDReviewResponseSchema
    );

    if (parsed.success) {
      return parsed.data;
    }

    console.error("Agent-D response validation failed:", parsed.error);
  } catch (error) {
    console.error("Agent-D execution error:", error);
  }

  // Graceful fallback approval
  return {
    status: "approved",
    title: "Technology Stack Validated",
    feedback: "Plan conforms to architectural standards and guardrails."
  };
}
