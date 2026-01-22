"use client";

import { motion } from "framer-motion";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";
import { ResearchStatus } from "./research-status";
import { QuestionSelector } from "./question-selector";
import { ValidationProgress } from "./validation-progress";
import type { Message, Plan, QuestionOption } from "@/app/lib/schemas/message";

interface MessageItemProps {
    message: Message;
    reviewAttempts: Map<string, number>;
    isLoading: boolean;
    planApproved: boolean;
    currentPlan: Plan | null;
    onSelectOption: (id: string, option: string | QuestionOption) => void;
    onReviewPlan: (plan: Plan) => void;
}

export function MessageItem({
    message,
    reviewAttempts,
    isLoading,
    planApproved,
    currentPlan,
    onSelectOption,
    onReviewPlan
}: MessageItemProps) {
    switch (message.type) {
        case "user":
        case "system":
        case "error":
            return <MessageBubble message={message} />;

        case "review":
            return (
                <ValidationProgress
                    status={message.status === "approved" ? "approved" : "changes_requested"}
                    feedback={message.feedback}
                    title={message.title}
                    attempt={reviewAttempts.get(message.id) || 1}
                />
            );

        case "thinking":
            return (
                <ThinkingIndicator
                    agent={message.agent}
                    status={message.status}
                />
            );

        case "research":
            return (
                <ResearchStatus
                    query={message.query}
                    sources={message.sources}
                    summary={message.summary}
                    isLoading={message.isLoading}
                />
            );

        case "question":
            return (
                <QuestionSelector
                    question={message.question}
                    options={message.options}
                    allowCustom={message.allowCustom}
                    allowMultiple={message.allowMultiple}
                    onSelect={(option) => onSelectOption(message.id, option)}
                    disabled={isLoading || message.answered}
                />
            );

        case "plan":
            const isPlanApproved = planApproved && message.plan.title === currentPlan?.title;
            return (
                <div>
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
                            onClick={() => onReviewPlan(message.plan)}
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
}
