import type { Message, Plan, QuestionOption } from "../schemas/message";
import type { CanvasNode, CanvasEdge } from "../schemas/canvas";
import type { AgentAResearchResult } from "../schemas/agent-responses";

export type AgentState = "idle" | "thinking" | "researching" | "questioning" | "planning" | "generating" | "validating";

export type ConversationPhase = "idle" | "initial_design" | "follow_up";

export interface ArchitectState {
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
    // New fields for conversation loop tracking
    conversationPhase: ConversationPhase;
    questionCountInRound: number;
    minQuestionsRequired: number; // 4 for initial_design, 1 for follow_up
}

export type ArchitectAction =
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
    | { type: "RESET" }
    // New actions for conversation loop tracking , needed for fresh states for research and plan
    | { type: "START_NEW_ROUND"; payload: { phase: ConversationPhase } }
    | { type: "INCREMENT_QUESTION_COUNT" }
    | { type: "SET_CONVERSATION_PHASE"; payload: ConversationPhase };

export interface ArchitectContextValue extends ArchitectState {
    sendMessage: (content: string) => Promise<void>;
    selectOption: (questionId: string, option: QuestionOption | string) => Promise<void>;
    approvePlan: () => Promise<void>;
    updateNodePosition: (id: string, position: { x: number; y: number }) => void;
    reset: () => void;
}
