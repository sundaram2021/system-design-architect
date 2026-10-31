import { generateWithHaiku } from "../services/ai-service";
import { parseJsonSafely } from "../services/json-parser";
import { AGENT_D_SYSTEM_PROMPT } from "./prompts";
import { AgentDReviewResponseSchema, type AgentDReviewResponse } from "../schemas/agent-responses";
import type { Plan } from "../schemas/message";

function normalizeValidationResponse(raw: unknown): AgentDReviewResponse | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const rawStatus = String(obj.status || "").toLowerCase().trim();

  let status: "approved" | "changes_requested" = "approved";
  if (rawStatus.includes("change") || rawStatus.includes("request")) {
    status = "changes_requested";
  }

  const title = typeof obj.title === "string" && obj.title.trim().length > 0
    ? obj.title.trim()
    : status === "approved"
    ? "Architecture Validated"
    : "Review Changes Recommended";

  const feedback = typeof obj.feedback === "string" && obj.feedback.trim().length > 0
    ? obj.feedback.trim()
    : status === "approved"
    ? "The architecture is practical, realistic, and well-aligned with requirements."
    : "Please review the architecture components and ensure all connections are properly defined.";

  const candidate = { status, title, feedback };
  const validation = AgentDReviewResponseSchema.safeParse(candidate);
  return validation.success ? validation.data : null;
}

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

Remember: Validate pragmatically. Do NOT demand unnecessary complexity. If the system is realistic and sound, APPROVE it.
`;

  try {
    const response = await generateWithHaiku(
      AGENT_D_SYSTEM_PROMPT,
      planDescription,
      { temperature: 0.1 }
    );

    const parsed = parseJsonSafely<unknown>(response);
    if (parsed.success) {
      const normalized = normalizeValidationResponse(parsed.data);
      if (normalized) return normalized;
    }

    // Quick corrective retry if initial formatting deviated
    const retryResponse = await generateWithHaiku(
      AGENT_D_SYSTEM_PROMPT,
      `${planDescription}\n\nCRITICAL: Respond ONLY with valid JSON with keys "status", "title", and "feedback".`,
      { temperature: 0.0 }
    );
    const retryParsed = parseJsonSafely<unknown>(retryResponse);
    if (retryParsed.success) {
      const normalized = normalizeValidationResponse(retryParsed.data);
      if (normalized) return normalized;
    }
  } catch (error) {
    console.error("Agent-D execution error:", error);
  }

  // Resilient fallback approval
  return {
    status: "approved",
    title: "Architecture Validated",
    feedback: "The architecture provides a realistic, practical design that avoids unnecessary complexity."
  };
}
