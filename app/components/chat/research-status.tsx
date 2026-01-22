"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VscLoading, VscChevronDown, VscLinkExternal } from "react-icons/vsc";
import { HiOutlineSearchCircle } from "react-icons/hi";
import type { ResearchSource } from "@/app/lib/schemas";

interface ResearchStatusProps {
    query: string;
    sources: ResearchSource[];
    summary: string;
    isLoading?: boolean;
}

export function ResearchStatus({ query, sources, summary, isLoading }: ResearchStatusProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const truncatedSummary = summary.length > 100
        ? summary.substring(0, 100) + "..."
        : summary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
        >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <VscLoading className="text-lg text-blue-400" />
                    </motion.div>
                ) : (
                    <HiOutlineSearchCircle className="text-lg text-blue-400" />
                )}
            </div>

            <div className="flex-1 min-w-0 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg rounded-tl-none overflow-hidden">
                <button
                    onClick={() => !isLoading && setIsExpanded(!isExpanded)}
                    disabled={isLoading}
                    className="w-full text-left"
                >
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-blue-400 uppercase tracking-wider">
                            Research Agent
                        </p>
                        {!isLoading && (
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-blue-400"
                            >
                                <VscChevronDown className="text-sm" />
                            </motion.div>
                        )}
                    </div>
                    <p className="text-xs text-foreground/70 truncate mt-1">
                        {isLoading ? "Searching..." : `Found ${sources.length} sources - ${truncatedSummary}`}
                    </p>
                </button>

                <AnimatePresence>
                    {isExpanded && !isLoading && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 mt-3 border-t border-blue-500/10">
                                <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                                    {summary}
                                </p>

                                {sources.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                                            Sources
                                        </p>
                                        {sources.map((source, i) => (
                                            <a
                                                key={i}
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-2 bg-white/5 rounded border border-border hover:border-blue-500/30 transition-colors group"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[11px] text-foreground/80 font-medium group-hover:text-blue-400 transition-colors line-clamp-1">
                                                        {source.title}
                                                    </p>
                                                    <VscLinkExternal className="text-[10px] text-foreground/40 flex-shrink-0 mt-0.5" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

