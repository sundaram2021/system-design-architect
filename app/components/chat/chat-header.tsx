"use client";

import { motion } from "framer-motion";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { VscSplitHorizontal } from "react-icons/vsc";

interface ChatHeaderProps {
    isVisible: boolean;
    onToggle: () => void;
}

export function ChatHeader({ isVisible, onToggle }: ChatHeaderProps) {
    return (
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
    );
}
