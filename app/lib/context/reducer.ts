import { Message } from "../schemas/message";
import { ArchitectState, ArchitectAction } from "./types";

export const initialState: ArchitectState = {
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
    planApproved: false,
    // New fields for conversation loop tracking
    conversationPhase: "idle",
    questionCountInRound: 0,
    minQuestionsRequired: 4,
};

export function reducer(state: ArchitectState, action: ArchitectAction): ArchitectState {
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

        case "START_NEW_ROUND":
            return {
                ...initialState,
                messages: [...state.messages],
                conversationPhase: action.payload.phase,
                minQuestionsRequired: action.payload.phase === "initial_design" ? 4 : 1,
                questionCountInRound: 0,
            };

        case "INCREMENT_QUESTION_COUNT":
            return {
                ...state,
                questionCountInRound: state.questionCountInRound + 1
            };

        case "SET_CONVERSATION_PHASE":
            return {
                ...state,
                conversationPhase: action.payload,
                minQuestionsRequired: action.payload === "initial_design" ? 4 : 1
            };

        case "RESET":
            return initialState;

        default:
            return state;
    }
}
