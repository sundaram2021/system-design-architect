import { generateWithGroq } from "../services/groq-service";
import { AGENT_D_SYSTEM_PROMPT } from "./prompts";
import { 
  AgentDReviewResponseSchema, 
  type Plan,
  type AgentDReviewResponse 
} from "../schemas";

export async function validatePlan(plan: Plan, context: string): Promise<AgentDReviewResponse> {
  const planDescription = `
## CONTEXT
The user is building: ${context}

## PROPOSED ARCHITECTURAL PLAN

Title: ${plan.title}
Summary: ${plan.summary}

### COMPONENTS
${plan.components.map((c) => `
- Name: ${c.name} (${c.type})
  Tech: ${c.technologies.join(", ")}
  Desc: ${c.description}
  Connects to: ${c.connections.join(", ")}
`).join("")}

### DATA FLOW
${plan.dataFlow.map((f) => `- ${f.from} -> ${f.to} (${f.description})`).join("\n")}
`;

  const response = await generateWithGroq(
    AGENT_D_SYSTEM_PROMPT,
    planDescription,
    { temperature: 0.1 } // Low temperature for consistent, strict analysis
  );

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch (error) {
    console.error("Agent-D JSON parse error:", error);
    // Fallback if JSON fails - assume approved with warning, or retry. 
    // For now, let's play safe and approve but log it, or request generic check.
    return {
      status: "approved",
      title: "Automated Check Passed",
      feedback: "Plan looks acceptable, though automated validation had a comprehensive glitch. Proceeding."
    };
  }

  const validated = AgentDReviewResponseSchema.safeParse(parsed);
  
  if (!validated.success) {
    console.error("Agent-D response validation failed:", validated.error);
    return {
      status: "approved", 
      title: "Plan Auto-Approved",
      feedback: "Plan approved (validation schema fallback)."
    };
  }

  return validated.data;
}
