"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VscGistSecret, VscCheck, VscLoading, VscError, VscDebugRestart, VscChevronDown, VscChevronUp } from "react-icons/vsc";
import { useEffect, useState } from "react";

interface ValidationProgressProps {
    status: "validating" | "changes_requested" | "approved";
    feedback?: string;
    title?: string;
    attempt?: number;
}

export function ValidationProgress({ status, feedback, title, attempt = 1 }: ValidationProgressProps) {
    const [checks, setChecks] = useState<{ label: string; status: "pending" | "checking" | "done" }[]>([
        { label: "Structural Integrity", status: "pending" },
        { label: "Security Protocols", status: "pending" },
        { label: "Scalability Assessment", status: "pending" },
        { label: "Technology Stack Verification", status: "pending" }
    ]);
    const [isExpanded, setIsExpanded] = useState(false);

    // checklist animation when entering "validating" state
    useEffect(() => {
        if (status === "validating") {
            let timeout: NodeJS.Timeout | undefined;

            const runChecks = async () => {
                setChecks(prev => prev.map(c => ({ ...c, status: "pending" })));

                for (let i = 0; i < 4; i++) {
                    setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: "checking" } : c));
                    await new Promise(r => setTimeout(r, 600)); 
                    setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: "done" } : c));
                }
            };

            runChecks();
            return () => clearTimeout(timeout);
        }
    }, [status, attempt]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${status === "approved"
                ? "bg-green-500/20 border-green-500/30"
                : status === "changes_requested"
                    ? "bg-purple-500/20 border-purple-500/30"
                    : "bg-blue-500/20 border-blue-500/30"
                }`}>
                <VscGistSecret className={`text-lg ${status === "approved" ? "text-green-400" : status === "changes_requested" ? "text-purple-400" : "text-blue-400"}`} />
            </div>

            <div className={`flex-1 min-w-0 p-3 rounded-lg rounded-tl-none border relative overflow-hidden transition-colors ${status === "approved"
                ? "bg-green-500/5 border-green-500/20"
                : status === "changes_requested"
                    ? "bg-purple-500/5 border-purple-500/30"
                    : "bg-blue-500/5 border-blue-500/20"
                }`}
            >
                {/* Background animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-xs font-bold uppercase tracking-wider ${status === "approved" ? "text-green-400" :
                                status === "changes_requested" ? "text-purple-400" :
                                    "text-blue-400"
                                }`}>
                                {status === "validating" ? "Validator Agent Reviewing..." :
                                    title || (status === "approved" ? "Validation Complete" : "Changes Requested")}
                            </h3>
                            {status === "validating" && (
                                <VscLoading className="animate-spin text-blue-400 text-xs" />
                            )}
                        </div>

                        {status === "changes_requested" && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-purple-400 hover:bg-purple-500/10 p-1 rounded transition-colors"
                            >
                                {isExpanded ? <VscChevronUp /> : <VscChevronDown />}
                            </button>
                        )}

                        {status === "approved" && <VscCheck className="text-green-400 text-base" />}
                    </div>

                    {status === "validating" && (
                        <div className="space-y-1 mt-2">
                            {checks.map((check, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px]">
                                    <div className="w-3 flex justify-center">
                                        {check.status === "pending" && <div className="w-1 h-1 rounded-full bg-foreground/20" />}
                                        {check.status === "checking" && <VscLoading className="animate-spin text-blue-400" />}
                                        {check.status === "done" && <VscCheck className="text-green-400" />}
                                    </div>
                                    <span className={check.status === "checking" ? "text-foreground" : "text-foreground/50"}>
                                        {check.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {status === "changes_requested" && (
                        <div>
                            <p className="text-xs text-foreground/60 mt-0.5 truncate">
                                Issues detected. Instructing Orchestrator Agent to revise...
                            </p>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 text-xs text-foreground/80 bg-black/20 p-2 rounded border border-purple-500/20 overflow-hidden"
                                    >
                                        <div className="flex items-start gap-2">
                                            <VscError className="mt-0.5 text-purple-400 flex-shrink-0" />
                                            <div className="leading-relaxed">
                                                {feedback}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
