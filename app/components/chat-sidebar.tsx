"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChatHeader } from "./chat/chat-header";
import { ChatInput } from "./chat/chat-input";
import { MessageList } from "./chat/message-list";
import { useReviewAttempts } from "./chat/hooks/use-review-attempts";
import { PlanReviewModal } from "./modals/plan-review-modal";
import { useArchitect } from "@/app/lib/context/architect-context";

interface ChatSidebarProps {
    isVisible: boolean;
    onToggle: () => void;
}

export function ChatSidebar({ isVisible, onToggle }: ChatSidebarProps) {
    const [showPlanModal, setShowPlanModal] = useState<boolean>(false);

    const {
        messages,
        currentPlan,
        agentState,
        isLoading,
        planApproved,
        sendMessage,
        selectOption,
        approvePlan
    } = useArchitect();

    const reviewAttempts = useReviewAttempts(messages);

    const handleApprove = async () => {
        setShowPlanModal(false);
        await approvePlan();
    };

    const getPlanStatus = () => {
        if (planApproved) return "approved";
        return "pending";
    };

    return (
        <>
            <motion.aside
                initial={{ width: 400 }}
                animate={{ width: isVisible ? 400 : 80 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="h-full bg-sidebar border-r border-border z-40 flex flex-col shadow-2xl relative overflow-hidden"
            >
                <ChatHeader isVisible={isVisible} onToggle={onToggle} />

                <MessageList
                    messages={messages}
                    agentState={agentState}
                    reviewAttempts={reviewAttempts}
                    isLoading={isLoading}
                    planApproved={planApproved}
                    currentPlan={currentPlan}
                    isVisible={isVisible}
                    onSelectOption={selectOption}
                    onReviewPlan={() => setShowPlanModal(true)}
                />

                <motion.div
                    animate={{ opacity: isVisible ? 1 : 0 }}
                >
                    <ChatInput
                        isLoading={isLoading}
                        onSendMessage={sendMessage}
                    />
                </motion.div>
            </motion.aside>

            {currentPlan && (
                <PlanReviewModal
                    plan={currentPlan}
                    isOpen={showPlanModal}
                    onClose={() => setShowPlanModal(false)}
                    onApprove={handleApprove}
                    status={getPlanStatus()}
                />
            )}
        </>
    );
}
