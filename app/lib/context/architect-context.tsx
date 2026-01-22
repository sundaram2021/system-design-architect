"use client";

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
    Message,
    Plan,
    CanvasNode,
    CanvasEdge,
    QuestionOption,
    AgentAResearchResult
} from "../schemas";

type AgentState = "idle" | "thinking" | "researching" | "questioning" | "planning" | "generating" | "validating";

interface ArchitectState {
    messages: Message[];
    currentPlan: Plan | null;
    canvasNodes: CanvasNode[];
    canvasEdges: CanvasEdge[];
    canvasTitle: string;
    agentState: AgentState;
    currentQuestionId: string | null;
    isLoading: boolean;
    researchResults: AgentAResearchResult[];
    planApproved: boolean;
}

type ArchitectAction =
    | { type: "ADD_MESSAGE"; payload: Message }
    | { type: "UPDATE_MESSAGE"; payload: { id: string; updates: Partial<Message> } }
    | { type: "SET_PLAN"; payload: Plan | null }
    | { type: "SET_CANVAS"; payload: { title: string; nodes: CanvasNode[]; edges: CanvasEdge[] } }
    | { type: "SET_AGENT_STATE"; payload: AgentState }
    | { type: "SET_CURRENT_QUESTION"; payload: string | null }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "UPDATE_NODE_POSITION"; payload: { id: string; position: { x: number; y: number } } }
    | { type: "ADD_RESEARCH_RESULT"; payload: AgentAResearchResult }
    | { type: "CLEAR_RESEARCH_RESULTS" }
    | { type: "SET_PLAN_APPROVED"; payload: boolean }
    | { type: "START_NEW_DESIGN" }
    | { type: "RESET" };

const initialState: ArchitectState = {
    messages: [
        {
            id: "system_welcome",
            type: "system",
            content: "Welcome, Architect. Describe the system you wish to design and I will help you create a comprehensive architecture.",
            timestamp: Date.now()
        }
    ],
    currentPlan: null,
    canvasNodes: [],
    canvasEdges: [],
    canvasTitle: "",
    agentState: "idle",
    currentQuestionId: null,
    isLoading: false,
    researchResults: [],
    planApproved: false
};

function reducer(state: ArchitectState, action: ArchitectAction): ArchitectState {
    switch (action.type) {
        case "ADD_MESSAGE":
            return { ...state, messages: [...state.messages, action.payload] };

        case "UPDATE_MESSAGE":
            return {
                ...state,
                messages: state.messages.map((m) => {
                    if (m.id === action.payload.id) {
                        return { ...m, ...action.payload.updates } as Message;
                    }
                    return m;
                })
            };

        case "SET_PLAN":
            return { ...state, currentPlan: action.payload, planApproved: false };

        case "SET_CANVAS":
            return {
                ...state,
                canvasTitle: action.payload.title,
                canvasNodes: action.payload.nodes,
                canvasEdges: action.payload.edges
            };

        case "SET_AGENT_STATE":
            return { ...state, agentState: action.payload };

        case "SET_CURRENT_QUESTION":
            return { ...state, currentQuestionId: action.payload };

        case "SET_LOADING":
            return { ...state, isLoading: action.payload };

        case "UPDATE_NODE_POSITION":
            return {
                ...state,
                canvasNodes: state.canvasNodes.map((n) =>
                    n.id === action.payload.id
                        ? { ...n, position: action.payload.position }
                        : n
                )
            };

        case "ADD_RESEARCH_RESULT":
            return {
                ...state,
                researchResults: [...state.researchResults, action.payload]
            };

        case "CLEAR_RESEARCH_RESULTS":
            return { ...state, researchResults: [] };

        case "SET_PLAN_APPROVED":
            return { ...state, planApproved: action.payload };

        case "START_NEW_DESIGN":
            return {
                ...state,
                currentPlan: null,
                researchResults: [],
                planApproved: false
            };

        case "RESET":
            return initialState;

        default:
            return state;
    }
}

interface ArchitectContextValue extends ArchitectState {
    sendMessage: (content: string) => Promise<void>;
    selectOption: (questionId: string, option: QuestionOption | string) => Promise<void>;
    approvePlan: () => Promise<void>;
    updateNodePosition: (id: string, position: { x: number; y: number }) => void;
    reset: () => void;
}

const ArchitectContext = createContext<ArchitectContextValue | null>(null);

export function ArchitectProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const performResearch = async (queries: { query: string; purpose: string }[] | undefined, singleQuery?: string, context?: string): Promise<AgentAResearchResult[]> => {
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

        const results: AgentAResearchResult[] = [];

        for (const q of researchQueries) {
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
                const response = await fetch("/api/research", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: q.query, context: context || "" })
                });

                const result = await response.json();
                results.push(result);
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
            } catch (error) {
                console.error("Research error:", error);
            }
        }

        dispatch({
            type: "UPDATE_MESSAGE",
            payload: {
                id: thinkingMessage.id,
                updates: { type: "system", content: "" } as Partial<Message>
            }
        });

        return results;
    };

    const handleAgentResponse = async (result: Record<string, unknown>, currentMessages: Message[], currentResearch: AgentAResearchResult[]): Promise<void> => {
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

                const continueResponse = await fetch("/api/orchestrate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userMessage: "Research completed. Generate the architectural plan now.",
                        messages: currentMessages,
                        researchResults: [...currentResearch, ...researchResults]
                    })
                });

                const continueResult = await continueResponse.json();

                dispatch({
                    type: "UPDATE_MESSAGE",
                    payload: { id: continueThinking.id, updates: { type: "system", content: "" } as Partial<Message> }
                });

                await handleAgentResponse(continueResult, currentMessages, [...currentResearch, ...researchResults]);
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

                const retryResponse = await fetch("/api/orchestrate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userMessage: "Fix the plan based on feedback.",
                        messages: messagesWithFeedback,
                        researchResults: currentResearch,
                        validationLoopCount: (data.loopCount || 0)
                    })
                });

                const retryResult = await retryResponse.json();

                dispatch({
                    type: "UPDATE_MESSAGE",
                    payload: { id: retryThinking.id, updates: { type: "system", content: "" } as Partial<Message> }
                });

                await handleAgentResponse(retryResult, messagesWithFeedback, currentResearch);
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
    };

    const sendMessage = useCallback(async (content: string) => {
        // Detect if this is a follow-up request (existing approved plan that user wants to modify)
        const isFollowUpRequest = state.planApproved && state.currentPlan;

        // Only start fresh if this is NOT a follow-up request
        if (!isFollowUpRequest) {
            dispatch({ type: "START_NEW_DESIGN" });
        }

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
            status: isFollowUpRequest ? "Processing your modification request..." : "Analyzing your requirements...",
            timestamp: Date.now()
        };
        dispatch({ type: "ADD_MESSAGE", payload: thinkingMessage });

        try {
            const response = await fetch("/api/orchestrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userMessage: content,
                    messages: [...state.messages, userMessage],
                    researchResults: isFollowUpRequest ? state.researchResults : [],
                    isEditRequest: isFollowUpRequest,
                    currentPlan: isFollowUpRequest ? state.currentPlan : null
                })
            });

            const result = await response.json();

            dispatch({
                type: "UPDATE_MESSAGE",
                payload: { id: thinkingMessage.id, updates: { type: "system", content: "" } as Partial<Message> }
            });

            await handleAgentResponse(result, [...state.messages, userMessage], isFollowUpRequest ? state.researchResults : []);
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
    }, [state.messages, state.planApproved, state.currentPlan, state.researchResults]);

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

        try {
            const updatedMessages = [...state.messages, userAnswer];

            const response = await fetch("/api/orchestrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userMessage: answerText,
                    messages: updatedMessages,
                    questionAnswer: { questionId, answer: answerText },
                    researchResults: state.researchResults
                })
            });

            const result = await response.json();

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
    }, [state.messages, state.researchResults]);

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
            const response = await fetch("/api/generate-canvas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: state.currentPlan })
            });

            const result = await response.json();

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
    }, [state.currentPlan]);

    const updateNodePosition = useCallback((id: string, position: { x: number; y: number }) => {
        dispatch({ type: "UPDATE_NODE_POSITION", payload: { id, position } });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    const value: ArchitectContextValue = {
        ...state,
        sendMessage,
        selectOption,
        approvePlan,
        updateNodePosition,
        reset
    };

    return (
        <ArchitectContext.Provider value={value}>
            {children}
        </ArchitectContext.Provider>
    );
}

export function useArchitect() {
    const context = useContext(ArchitectContext);
    if (!context) {
        throw new Error("useArchitect must be used within an ArchitectProvider");
    }
    return context;
}
