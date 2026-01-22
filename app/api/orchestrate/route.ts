import { NextResponse } from "next/server";
import { orchestrate, processUserAnswer, processResearchResults, requestPlanEdit } from "@/app/lib/agents/agent-b";
import { validatePlan } from "@/app/lib/agents/agent-d";
import type { Message, AgentAResearchResult, Plan, AgentBResponse } from "@/app/lib/schemas";

// Helper to convert agent response to valid JSON response
function createResponse(data: any) {
  return NextResponse.json(data);
}

// Helper to sleep for a bit to prevent rate limits or rapid loops
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userMessage, 
      messages, 
      questionAnswer, 
      researchResults,
      currentPlan,
      isEditRequest,
      validationLoopCount = 0 // Track loops to prevent infinite cycles
    } = body;

    const context = {
      messages: messages as Message[],
      researchResults: researchResults as AgentAResearchResult[] | undefined,
      questionAnswers: questionAnswer ? [questionAnswer] : undefined
    };

    let result: AgentBResponse;

    // 1. Determine which Agent-B function to call
    if (isEditRequest && currentPlan) {
      result = await requestPlanEdit(userMessage, { ...context, messages: [...messages] });
    } else if (questionAnswer) {
      result = await processUserAnswer(
        questionAnswer.questionId,
        questionAnswer.answer,
        context
      );
    } else if (researchResults && researchResults.length > 0) {
      result = await processResearchResults(researchResults, context);
    } else {
      result = await orchestrate(userMessage, context);
    }

    // 2. Intercept Agent-B's PLAN response for validation (ONE-TIME only)
    if (result.type === "plan" && validationLoopCount < 1) {
      const plan = result.data as unknown as Plan; // Type casting for convenience
      const userGoal = messages.find((m: Message) => m.type === "user")?.content || "System Architecture";

      // 3. Call Agent-D
      const validation = await validatePlan(plan, userGoal);

      if (validation.status === "changes_requested") {
        // Return a SPECIAL response type that the frontend knows how to just handle as "Agent-D feedback"
        // OR better: Handle the loop recursively here? 
        // Recursive is risky for timeouts. Let's return the feedback to the client, 
        // and let the client re-submit with the feedback as a "system" message for Agent-B.
        // Actually, for a smoother flow, let's treat this as a "review" response.
        
        return createResponse({
          type: "review",
          data: {
            status: "changes_requested",
            title: validation.title,
            feedback: validation.feedback,
            originalPlan: plan,
            loopCount: validationLoopCount + 1
          }
        });
      }

      // If approved, we return the plan AS IS, but maybe Attach the approval note?
      // We can just return the plan. The frontend will accept it.
      // Optionally we can send the approval message too.
      return createResponse({
        ...result,
        approvalFeedback: validation.feedback
      });
    }

    return createResponse(result);

  } catch (error) {
    console.error("Orchestrate API error:", error);
    return NextResponse.json(
      { 
        type: "thinking", 
        data: { status: "Processing error..." } 
      },
      { status: 500 }
    );
  }
}
