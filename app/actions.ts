"use server";

import { performResearch } from "@/app/lib/agents/agent-a";
import { orchestrate, processUserAnswer, processResearchResults, requestPlanEdit } from "@/app/lib/agents/agent-b";
import { validatePlan } from "@/app/lib/agents/agent-d";
import { generateCanvas } from "@/app/lib/agents/agent-c";
import type { Message, Plan } from "@/app/lib/schemas/message";
import type { AgentAResearchResult, AgentBResponse } from "@/app/lib/schemas/agent-responses";

export async function performResearchAction(query: string, context?: string) {
  if (!query) {
    throw new Error("Query is required");
  }
  return await performResearch(query, context || "");
}

export async function orchestrateAction(
  userMessage: string,
  messages: Message[],
  questionAnswer?: { questionId: string; answer: string },
  researchResults?: AgentAResearchResult[],
  currentPlan?: Plan | null,
  isEditRequest?: boolean,
  validationLoopCount: number = 0,
  phase: "initial_design" | "follow_up" = "initial_design"
) {
  try {
    const context = {
        messages: messages,
        researchResults: researchResults,
        questionAnswers: questionAnswer ? [questionAnswer] : undefined
    };

    let result: AgentBResponse;

    // 1. Determine which Agent-B function to call
    if (isEditRequest && currentPlan) {
      result = await requestPlanEdit(userMessage, { ...context, messages: [...messages] }, phase);
    } else if (questionAnswer) {
      result = await processUserAnswer(
        questionAnswer.questionId,
        questionAnswer.answer,
        context,
        phase
      );
    } else if (researchResults && researchResults.length > 0) {
      result = await processResearchResults(researchResults, context, phase);
    } else {
      result = await orchestrate(userMessage, context, phase);
    }

    // 2. Intercept Agent-B's PLAN response for validation (ONE-TIME only)
    if (result.type === "plan" && validationLoopCount < 1) {
      const plan = result.data as unknown as Plan; // Type casting for convenience
      const userGoal = messages.find((m: Message) => m.type === "user")?.content || "System Architecture";

      // 3. Call Agent-D
      const validation = await validatePlan(plan, userGoal);

      if (validation.status === "changes_requested") {
        return {
          type: "review",
          data: {
            status: "changes_requested",
            title: validation.title,
            feedback: validation.feedback,
            originalPlan: plan,
            loopCount: validationLoopCount + 1
          }
        };
      }

      // If approved, we return the plan as it is
      return {
        ...result,
        approvalFeedback: validation.feedback
      };
    }

    return result;

  } catch (error) {
    console.error("Orchestrate Action error:", error);
    // Return a structured error response that matches what the client expects
    return { 
        type: "thinking", 
        data: { status: "Processing error..." } 
    };
  }
}

export async function generateCanvasAction(plan: Plan) {
    if (!plan) {
        throw new Error("Plan is required");
    }
    return await generateCanvas(plan);
}
