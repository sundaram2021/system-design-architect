import { useCallback, Dispatch, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message, Plan, QuestionOption } from "../schemas/message";
import type { AgentAResearchResult, AgentBResponse } from "../schemas/agent-responses";
import { performResearchAction, orchestrateAction, generateCanvasAction } from "@/app/actions";
import { ArchitectState, ArchitectAction } from "./types";

export function useArchitectLogic(state: ArchitectState, dispatch: Dispatch<ArchitectAction>) {

    const performResearch = useCallback(async (queries: { query: string; purpose: string }[] | undefined, singleQuery?: string, context?: string): Promise<AgentAResearchResult[]> => {
        const researchQueries = queries || (singleQuery ? [{ query: singleQuery, purpose: "general" }] : []);

        if (researchQueries.length === 0) return [];

        const thinkingMessage: Message = {
            id: uuidv4(),
            type: "thinking",
            agent: "agent-a",
            status: "Researching technology options...",
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: thinkingMessage });

        // Execute all research queries in parallel to avoid waterfall -- testing issue fixed
        const researchPromises = researchQueries.map(async (q) => {
            const researchMessage: Message = {
                id: uuidv4(),
                type: "research",
                query: q.query,
                sources: [],
                summary: "",
                isLoading: true,
                timestamp: Date.now()
            };
            dispatch({ type: "ADD_MESSAGE", payload: researchMessage });

            try {
                const result = await performResearchAction(q.query, context || "");

                dispatch({ type: "ADD_RESEARCH_RESULT", payload: result });

                dispatch({
                    type: "UPDATE_MESSAGE",
                    payload: {
                        id: researchMessage.id,
                        updates: {
                            sources: result.sources,
                            summary: result.summary,
                            isLoading: false
                        } as Partial<Message>
                    }
                });
                return result;
            } catch (error) {
                console.error("Research error:", error);
                return null;
            }
        });

        const results = (await Promise.all(researchPromises)).filter((r): r is AgentAResearchResult => r !== null);

        dispatch({
            type: "UPDATE_MESSAGE",
            payload: {
                id: thinkingMessage.id,
                updates: { type: "system", content: "" } as Partial<Message>
            }
        });

        return results;
    }, [dispatch]);

    const handleAgentResponseRef = useRef<((result: Record<string, unknown>, currentMessages: Message[], currentResearch: AgentAResearchResult[]) => Promise<void>) | null>(null);

    const handleAgentResponse = useCallback(async (result: Record<string, unknown>, currentMessages: Message[], currentResearch: AgentAResearchResult[]): Promise<void> => {
        if (result.type === "question") {
            const data = result.data as { id: string; question: string; options: QuestionOption[]; allowCustom: boolean; allowMultiple?: boolean };
            const questionMessage: Message = {
                id: uuidv4(),
                type: "question",
                question: data.question,
                options: data.options,
                allowCustom: data.allowCustom,
                allowMultiple: data.allowMultiple,
                timestamp: Date.now()
            };
            dispatch({ type: "ADD_MESSAGE", payload: questionMessage });
            dispatch({ type: "SET_CURRENT_QUESTION", payload: data.id });
            dispatch({ type: "SET_AGENT_STATE", payload: "questioning" });
            dispatch({ type: "INCREMENT_QUESTION_COUNT" });
        } else if (result.type === "research_needed") {
            dispatch({ type: "SET_AGENT_STATE", payload: "researching" });
            const data = result.data as { queries?: { query: string; purpose: string }[]; query?: string; context?: string };

            const researchResults = await performResearch(
                data.queries,
                data.query,
                data.context
            );

            if (researchResults.length > 0) {
                dispatch({ type: "SET_AGENT_STATE", payload: "thinking" });

                const continueThinking: Message = {
                    id: uuidv4(),
                    type: "thinking",
                    agent: "agent-b",
                    status: "Analyzing research and creating plan...",
                    timestamp: Date.now()
                };
                dispatch({ type: "ADD_MESSAGE", payload: continueThinking });

                const continueResult = await orchestrateAction(
                    "Research completed. Generate the architectural plan now.",
                    currentMessages,
                    undefined,
                    [...currentResearch, ...researchResults],
                    undefined,
                    undefined,
                    0,
                    "initial_design"
                ) as AgentBResponse;

                dispatch({
                    type: "UPDATE_MESSAGE",
                    payload: { id: continueThinking.id, updates: { type: "system", content: "" } as Partial<Message> }
                });

                if (handleAgentResponseRef.current) {
                    await handleAgentResponseRef.current(continueResult, currentMessages, [...currentResearch, ...researchResults]);
                }
            }
        } else if (result.type === "review") {
            // Handle Agent-D Feedback
            const data = result.data as { status: string; feedback: string; title?: string; loopCount?: number };

            // Show Agent-D's thinking or feedback bubble with dynamic title
            const reviewMessage: Message = {
                id: uuidv4(),
                type: "review",
                status: data.status as "changes_requested" | "approved",
                feedback: data.feedback,
                title: data.title, // Pass the dynamic title from Agent-D
                timestamp: Date.now()
            };
            dispatch({ type: "ADD_MESSAGE", payload: reviewMessage });
            dispatch({ type: "SET_AGENT_STATE", payload: "validating" });

            if (data.status === "changes_requested") {
                // AUTO-RETRY: Send the feedback back to Agent-B
                const retryThinking: Message = {
                    id: uuidv4(),
                    type: "thinking",
                    agent: "agent-b",
                    status: "Incorporating Validator Feedback...",
                    timestamp: Date.now()
                };
                dispatch({ type: "ADD_MESSAGE", payload: retryThinking });

                const messagesWithFeedback: Message[] = [...currentMessages, {
                    id: uuidv4(),
                    type: "system",
                    content: `PRINCIPAL ARCHITECT FEEDBACK (Must Implement): ${data.feedback}`,
                    timestamp: Date.now()
                }];

                const retryResult = await orchestrateAction(
                    "Fix the plan based on feedback.",
                    messagesWithFeedback,
                    undefined,
                    currentResearch,
                    undefined,
                    undefined,
                    (data.loopCount || 0),
                    "initial_design"
                ) as AgentBResponse;

                dispatch({
                    type: "UPDATE_MESSAGE",
                    payload: { id: retryThinking.id, updates: { type: "system", content: "" } as Partial<Message> }
                });

                if (handleAgentResponseRef.current) {
                    await handleAgentResponseRef.current(retryResult, messagesWithFeedback, currentResearch);
                }
            }

        } else if (result.type === "plan") {
            const planData = result.data as Plan;
            const planMessage: Message = {
                id: uuidv4(),
                type: "plan",
                plan: planData,
                status: "pending",
                timestamp: Date.now()
            };
            dispatch({ type: "ADD_MESSAGE", payload: planMessage });
            dispatch({ type: "SET_PLAN", payload: planData });
            dispatch({ type: "SET_AGENT_STATE", payload: "planning" });
        }
    }, [dispatch, performResearch]);

    handleAgentResponseRef.current = handleAgentResponse;

    const sendMessage = useCallback(async (content: string) => {
        const lowerContent = content.toLowerCase();
        const hasExistingApprovedPlan = state.planApproved && state.currentPlan;

        // Determine if this is initial design or follow-up/scaling , needed for agent-B behavior
        const isFollowUpRequest = !!hasExistingApprovedPlan;

        // Determine phase: follow-up includes scaling, modifications, additions
        const phase: "initial_design" | "follow_up" = hasExistingApprovedPlan ? "follow_up" : "initial_design";

        // ALWAYS start fresh for clear-and-regenerate behavior (per user requirement)
        dispatch({
            type: "START_NEW_ROUND",
            payload: { phase }
        });

        const userMessage: Message = {
            id: uuidv4(),
            type: "user",
            content,
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: userMessage });
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_AGENT_STATE", payload: "thinking" });

        const thinkingMessage: Message = {
            id: uuidv4(),
            type: "thinking",
            agent: "agent-b",
            status: isFollowUpRequest ? "Processing your request..." : "Analyzing your requirements...",
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: thinkingMessage });

        try {
            // Pass phase to orchestrateAction
            // Always use fresh state for new rounds (no old research, no old plan)
            const result = await orchestrateAction(
                content,
                [...state.messages, userMessage],
                undefined,
                [], // Always fresh research for new round
                null, // Always clear plan for regeneration
                false,
                0,
                phase // Pass phase
            ) as AgentBResponse;

            dispatch({
                type: "UPDATE_MESSAGE",
                payload: { id: thinkingMessage.id, updates: { type: "system", content: "" } as Partial<Message> }
            });

            await handleAgentResponse(result, [...state.messages, userMessage], []);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: uuidv4(),
                type: "error",
                message: "Failed to process your request. Please try again.",
                timestamp: Date.now()
            };
            dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, [state.messages, state.planApproved, state.currentPlan, state.researchResults, dispatch, handleAgentResponse]);

    const selectOption = useCallback(async (questionId: string, option: QuestionOption | string) => {
        const answerText = typeof option === "string" ? option : option.label;

        const userAnswer: Message = {
            id: uuidv4(),
            type: "user",
            content: answerText,
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: userAnswer });
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_AGENT_STATE", payload: "thinking" });
        dispatch({ type: "SET_CURRENT_QUESTION", payload: null });

        const thinkingMessage: Message = {
            id: uuidv4(),
            type: "thinking",
            agent: "agent-b",
            status: "Processing your answer...",
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: thinkingMessage });

        // Mark the question as answered/disabled immediately
        dispatch({
            type: "UPDATE_MESSAGE",
            payload: {
                id: questionId,
                updates: { answered: true } as Partial<Message>
            }
        });

        try {
            const updatedMessages = [...state.messages, userAnswer];

            const phase: "initial_design" | "follow_up" =
                state.conversationPhase === "idle" ? "initial_design" :
                state.conversationPhase === "initial_design" || state.conversationPhase === "follow_up"
                ? state.conversationPhase : "initial_design";

            const result = await orchestrateAction(
                answerText,
                updatedMessages,
                { questionId, answer: answerText },
                state.researchResults,
                null,
                false,
                0,
                phase
            ) as AgentBResponse;

            dispatch({
                type: "UPDATE_MESSAGE",
                payload: { id: thinkingMessage.id, updates: { type: "system", content: "" } as Partial<Message> }
            });

            await handleAgentResponse(result, updatedMessages, state.researchResults);
        } catch (error) {
            console.error("Error selecting option:", error);
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, [state.messages, state.researchResults, state.conversationPhase, dispatch, handleAgentResponse]);

    const approvePlan = useCallback(async () => {
        if (!state.currentPlan) return;

        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_AGENT_STATE", payload: "generating" });
        dispatch({ type: "SET_PLAN_APPROVED", payload: true });

        const generatingMessage: Message = {
            id: uuidv4(),
            type: "canvas",
            status: "generating",
            message: "Generating architecture diagram...",
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: generatingMessage });

        try {
            const result = await generateCanvasAction(state.currentPlan);

            dispatch({
                type: "SET_CANVAS",
                payload: {
                    title: result.title || state.currentPlan.title,
                    nodes: result.nodes,
                    edges: result.edges
                }
            });
            dispatch({
                type: "UPDATE_MESSAGE",
                payload: {
                    id: generatingMessage.id,
                    updates: { status: "complete", message: "Architecture diagram generated!" } as Partial<Message>
                }
            });
        } catch (error) {
            console.error("Error generating canvas:", error);
            dispatch({
                type: "UPDATE_MESSAGE",
                payload: {
                    id: generatingMessage.id,
                    updates: { status: "error", message: "Failed to generate diagram" } as Partial<Message>
                }
            });
            dispatch({ type: "SET_PLAN_APPROVED", payload: false });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
            dispatch({ type: "SET_AGENT_STATE", payload: "idle" });
        }
    }, [state.currentPlan, dispatch]);

    const updateNodePosition = useCallback((id: string, position: { x: number; y: number }) => {
        dispatch({ type: "UPDATE_NODE_POSITION", payload: { id, position } });
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, [dispatch]);

    return {
        sendMessage,
        selectOption,
        approvePlan,
        updateNodePosition,
        reset
    };
}
