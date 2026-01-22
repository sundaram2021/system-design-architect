"use client";

import { motion } from "framer-motion";
import { MessageItem } from "./message-item";
import { ThinkingIndicator } from "./thinking-indicator";
import { ValidationProgress } from "./validation-progress";
import { useChatScroll } from "./hooks/use-chat-scroll";
import type { Message, Plan, QuestionOption } from "@/app/lib/schemas/message";

interface MessageListProps {
    messages: Message[];
    agentState: string;
    reviewAttempts: Map<string, number>;
    isLoading: boolean;
    planApproved: boolean;
    currentPlan: Plan | null;
    isVisible: boolean;
    onSelectOption: (id: string, option: string | QuestionOption) => void;
    onReviewPlan: (plan: Plan) => void;
}

export function MessageList({
    messages,
    agentState,
    reviewAttempts,
    isLoading,
    planApproved,
    currentPlan,
    isVisible,
    onSelectOption,
    onReviewPlan
}: MessageListProps) {
    const messagesEndRef = useChatScroll(messages);

    return (
        <motion.div
            animate={{ opacity: isVisible ? 1 : 0 }}
            className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 min-w-[400px]"
        >
            {messages.map((message) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    reviewAttempts={reviewAttempts}
                    isLoading={isLoading}
                    planApproved={planApproved}
                    currentPlan={currentPlan}
                    onSelectOption={onSelectOption}
                    onReviewPlan={onReviewPlan}
                />
            ))}

            {agentState === "thinking" && !messages.some(m => m.type === "thinking") && (
                <ThinkingIndicator agent="agent-b" status="Processing..." />
            )}

            {agentState === "validating" && (
                <ValidationProgress status="validating" />
            )}

            <div ref={messagesEndRef} />
        </motion.div>
    );
}
