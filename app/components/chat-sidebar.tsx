"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { VscSplitHorizontal, VscSend } from "react-icons/vsc";
import { ArchitectInput } from "./ui/architect-input";
import { ArchitectButton } from "./ui/architect-button";
import { MessageBubble, ThinkingIndicator, ResearchStatus, QuestionSelector, ValidationProgress } from "./chat";
import { PlanReviewModal } from "./modals/plan-review-modal";
import { useArchitect } from "@/app/lib/context/architect-context";

interface ChatSidebarProps {
    isVisible: boolean;
    onToggle: () => void;
}

export function ChatSidebar({ isVisible, onToggle }: ChatSidebarProps) {
    const [input, setInput] = useState("");
    const [showPlanModal, setShowPlanModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const message = input.trim();
        setInput("");
        await sendMessage(message);
    };

    const handleApprove = async () => {
        setShowPlanModal(false);
        await approvePlan();
    };

    const getPlanStatus = () => {
        if (planApproved) return "approved";
        return "pending";
    };

    const renderMessage = (message: typeof messages[0]) => {
        switch (message.type) {
            case "user":
            case "system":
            case "error":
                return <MessageBubble key={message.id} message={message} />;

            case "review":
                const previousReviews = messages.slice(0, messages.indexOf(message)).filter(m => m.type === "review").length;
                return (
                    <ValidationProgress
                        key={message.id}
                        status={message.status === "approved" ? "approved" : "changes_requested"}
                        feedback={message.feedback}
                        title={message.title}
                        attempt={previousReviews + 1}
                    />
                );

            case "thinking":
                return (
                    <ThinkingIndicator
                        key={message.id}
                        agent={message.agent}
                        status={message.status}
                    />
                );

            case "research":
                return (
                    <ResearchStatus
                        key={message.id}
                        query={message.query}
                        sources={message.sources}
                        summary={message.summary}
                        isLoading={message.isLoading}
                    />
                );

            case "question":
                return (
                    <QuestionSelector
                        key={message.id}
                        question={message.question}
                        options={message.options}
                        allowCustom={message.allowCustom}
                        allowMultiple={message.allowMultiple}
                        onSelect={(option) => selectOption(message.id, option)}
                        disabled={isLoading}
                    />
                );

            case "plan":
                const isPlanApproved = planApproved && message.plan.title === currentPlan?.title;
                return (
                    <div key={message.id}>
                        {/* Always show validation success before the plan */}
                        <div className="mb-2">
                            <ValidationProgress
                                status="approved"
                                title="Validator Agent: Validated"
                                feedback="Plan successfully validated."
                            />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-accent/5 border border-accent/20 rounded-lg"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="px-2 py-0.5 rounded bg-green-500/10 text-[10px] font-bold text-green-400 uppercase tracking-wider border border-green-500/20">
                                    Validated
                                </div>
                                <p className="text-xs text-accent uppercase tracking-wider">
                                    Architectural Plan Ready
                                </p>
                            </div>

                            <p className="text-sm text-foreground font-medium mb-3">
                                {message.plan.title}
                            </p>
                            <p className="text-xs text-foreground/60 mb-4 line-clamp-2">
                                {message.plan.summary}
                            </p>
                            <button
                                onClick={() => setShowPlanModal(true)}
                                disabled={isPlanApproved}
                                className="w-full py-2 bg-accent text-background text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {isPlanApproved ? "Plan Approved" : "Review Plan"}
                            </button>
                            {isPlanApproved && (
                                <p className="text-xs text-green-400 mt-2 text-center">Diagram Generated</p>
                            )}
                        </motion.div>
                    </div>
                );

            case "canvas":
                return (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${message.status === "generating"
                            ? "bg-blue-500/5 border-blue-500/20"
                            : message.status === "complete"
                                ? "bg-green-500/5 border-green-500/20"
                                : "bg-red-500/5 border-red-500/20"
                            }`}
                    >
                        <p className={`text-xs uppercase tracking-wider mb-1 ${message.status === "generating"
                            ? "text-blue-400"
                            : message.status === "complete"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}>
                            Canvas Generator Agent
                        </p>
                        <p className="text-sm text-foreground/80">{message.message}</p>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <motion.aside
                initial={{ width: 400 }}
                animate={{ width: isVisible ? 400 : 80 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="h-full bg-sidebar border-r border-border z-40 flex flex-col shadow-2xl relative overflow-hidden"
            >
                <div className="p-6 border-b border-border flex items-center justify-between min-w-[400px]">
                    <motion.div
                        animate={{ opacity: isVisible ? 1 : 0 }}
                        className="flex items-center gap-3"
                    >
                        <HiOutlineChatAlt2 className="text-accent text-2xl" />
                        <h2 className="text-sm font-bold tracking-widest uppercase text-foreground/80">
                            AI Architect
                        </h2>
                    </motion.div>

                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-white/5 rounded-md transition-colors absolute right-4 top-6"
                    >
                        <VscSplitHorizontal className="text-xl text-accent" />
                    </button>
                </div>

                <motion.div
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 min-w-[400px]"
                >
                    {messages.map(renderMessage)}

                    {agentState === "thinking" && !messages.some(m => m.type === "thinking") && (
                        <ThinkingIndicator agent="agent-b" status="Processing..." />
                    )}

                    {agentState === "validating" && (
                        <ValidationProgress status="validating" />
                    )}

                    <div ref={messagesEndRef} />
                </motion.div>

                <motion.div
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    className="p-6 border-t border-border bg-sidebar/50 backdrop-blur-sm min-w-[400px]"
                >
                    <form onSubmit={handleSubmit} className="relative flex gap-2">
                        <div className="flex-1">
                            <ArchitectInput
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter your idea..."
                                disabled={isLoading}
                            />
                        </div>
                        <ArchitectButton
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            isLoading={isLoading}
                            icon={<VscSend />}
                        />
                    </form>
                    <p className="mt-3 text-[10px] text-foreground/30 uppercase tracking-[0.2em] text-center">
                        Architectural Engine v1.0
                    </p>
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
