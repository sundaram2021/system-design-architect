"use client";

import { motion } from "framer-motion";
import { VscGistSecret } from "react-icons/vsc";
import { HiOutlineUser } from "react-icons/hi";
import { RiRobot2Line } from "react-icons/ri";
import type { Message } from "@/app/lib/schemas";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    if (message.type === "user") {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end gap-3"
            >
                <div className="max-w-[85%] p-4 bg-accent/10 border border-accent/20 rounded-lg rounded-br-none">
                    <p className="text-sm text-foreground">{message.content}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <HiOutlineUser className="text-accent text-lg" />
                </div>
            </motion.div>
        );
    }

    if (message.type === "system") {
        // Skip empty system messages (used for hiding thinking indicators)
        if (!message.content || message.content.trim() === "") {
            return null;
        }
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 justify-center py-2"
            >
                <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                    <RiRobot2Line className="text-foreground/40 text-sm" />
                </div>
                <p className="text-xs text-foreground/40 uppercase tracking-wider">{message.content}</p>
            </motion.div>
        );
    }

    if (message.type === "review") {
        const isApproved = message.status === "approved";
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3"
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <VscGistSecret className={`text-lg ${isApproved ? "text-green-400" : "text-purple-400"}`} />
                </div>
                <div className={`flex-1 min-w-0 max-w-[85%] p-4 border rounded-lg rounded-tl-none overflow-hidden ${isApproved
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-purple-500/5 border-purple-500/30"
                    }`}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold tracking-wider uppercase ${isApproved ? "text-green-400" : "text-purple-400"}`}>
                                Validator Agent
                            </span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {message.feedback}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (message.type === "error") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <RiRobot2Line className="text-red-400 text-lg" />
                </div>
                <div className="flex-1 p-4 bg-red-500/10 border border-red-500/20 rounded-lg rounded-tl-none">
                    <p className="text-sm text-red-400">{message.message}</p>
                </div>
            </motion.div>
        );
    }

    return null;
}

