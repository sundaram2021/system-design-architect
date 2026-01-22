"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VscClose, VscCheck } from "react-icons/vsc";
import type { Plan } from "@/app/lib/schemas/message";

interface PlanReviewModalProps {
    plan: Plan;
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    status: "pending" | "approved" | "editing";
}

export function PlanReviewModal({
    plan,
    isOpen,
    onClose,
    onApprove,
    status
}: PlanReviewModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-3xl max-h-[80vh] bg-sidebar border border-border rounded-xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div>
                                <p className="text-xs text-accent uppercase tracking-wider mb-1">Architectural Plan</p>
                                <h2 className="text-lg font-bold text-foreground">{plan.title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <VscClose className="text-xl text-foreground/60" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-6">
                            <div>
                                <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Summary</h3>
                                <p className="text-sm text-foreground/80 leading-relaxed">{plan.summary}</p>
                            </div>

                            <div>
                                <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Components</h3>
                                <div className="grid gap-3">
                                    {plan.components.map((component) => (
                                        <div
                                            key={component.id}
                                            className="p-4 bg-white/5 border border-border rounded-lg"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{component.name}</p>
                                                    <p className="text-[10px] text-accent uppercase tracking-wider">{component.type}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-foreground/60 mb-3">{component.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {component.technologies.map((tech, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Data Flow</h3>
                                <div className="space-y-2">
                                    {plan.dataFlow.map((flow, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 text-xs text-foreground/70"
                                        >
                                            <span className="px-2 py-1 bg-white/5 rounded">{flow.from}</span>
                                            <span className="text-accent">-&gt;</span>
                                            <span className="px-2 py-1 bg-white/5 rounded">{flow.to}</span>
                                            <span className="text-foreground/40">: {flow.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border">
                            <button
                                onClick={onApprove}
                                disabled={status === "approved"}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-background text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                <VscCheck className="text-lg" />
                                {status === "approved" ? "Approved" : "Approve & Generate Diagram"}
                            </button>
                            <p className="text-[10px] text-foreground/30 text-center mt-3">
                                Close this modal and use the chat to request changes
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
