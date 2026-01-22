"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VscAdd, VscClose, VscWarning } from "react-icons/vsc";

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function NewChatModal({ isOpen, onClose, onConfirm }: NewChatModalProps) {
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
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-sidebar border border-border rounded-xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <VscWarning className="text-xl text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                            Start New Design
                                        </h2>
                                        <p className="text-[10px] text-foreground/40 uppercase tracking-wider mt-0.5">
                                            Confirmation Required
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <VscClose className="text-lg text-foreground/60" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-foreground/70 leading-relaxed mb-2">
                                Starting a new design session will clear your current conversation and architecture diagram.
                            </p>
                            <p className="text-xs text-foreground/50">
                                This action cannot be undone. Are you sure you want to continue?
                            </p>
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-white/5 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-background text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
                            >
                                <VscAdd className="text-lg" />
                                New Design
                            </button>
                        </div>

                        <div className="px-6 pb-4">
                            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
