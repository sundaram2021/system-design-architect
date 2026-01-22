"use client";

import { motion } from "framer-motion";
import { VscLoading } from "react-icons/vsc";
import { HiOutlineSearchCircle, HiOutlineLightBulb, HiOutlineCube } from "react-icons/hi";
import { VscGistSecret } from "react-icons/vsc";

interface ThinkingIndicatorProps {
    agent: "agent-a" | "agent-b" | "agent-c" | "agent-d";
    status: string;
}

const agentConfig = {
    "agent-a": {
        icon: HiOutlineSearchCircle,
        label: "Research Agent",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
    },
    "agent-b": {
        icon: HiOutlineLightBulb,
        label: "Orchestrator Agent",
        color: "text-accent",
        bgColor: "bg-accent/20",
        borderColor: "border-accent/30"
    },
    "agent-c": {
        icon: HiOutlineCube,
        label: "Canvas Generator Agent",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30"
    },
    "agent-d": {
        icon: VscGistSecret,
        label: "Validator Agent",
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
    }
};

export function ThinkingIndicator({ agent, status }: ThinkingIndicatorProps) {
    const config = agentConfig[agent];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                <Icon className={`text-lg ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0 p-4 bg-white/5 border border-border rounded-lg rounded-tl-none">
                <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">
                    {config.label}
                </p>
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <VscLoading className={`text-sm ${config.color}`} />
                    </motion.div>
                    <p className="text-sm text-foreground/70">{status}</p>
                </div>
            </div>
        </motion.div>
    );
}

