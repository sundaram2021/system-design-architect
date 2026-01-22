"use client";

import { useState } from "react";
import { VscSend } from "react-icons/vsc";
import { ArchitectInput } from "../ui/architect-input";
import { ArchitectButton } from "../ui/architect-button";

interface ChatInputProps {
    isLoading: boolean;
    onSendMessage: (message: string) => Promise<void>;
}

export function ChatInput({ isLoading, onSendMessage }: ChatInputProps) {
    const [input, setInput] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const message = input.trim();
        setInput("");
        await onSendMessage(message);
    };

    return (
        <div className="p-6 border-t border-border bg-sidebar/50 backdrop-blur-sm min-w-[400px]">
            <form onSubmit={handleSubmit} className="relative flex gap-2">
                <div className="flex-1">
                    <ArchitectInput
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
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
        </div>
    );
}
