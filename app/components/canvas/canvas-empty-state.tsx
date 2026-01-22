import { motion } from "framer-motion";
import { VscInbox } from "react-icons/vsc";
import { NewChatModal } from "../modals/new-chat-modal";
import { NewDesignButton } from "./new-design-button";
import { useState } from "react";

interface CanvasEmptyStateProps {
    onNewChat: () => void;
}

export const CanvasEmptyState = ({ onNewChat }: CanvasEmptyStateProps) => {
    const [showNewChatModal, setShowNewChatModal] = useState(false);

    const handleConfirmNewChat = () => {
        onNewChat();
        setShowNewChatModal(false);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="w-full h-full border border-border bg-black/40 rounded-xl relative overflow-hidden architect-grid">
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <div className="z-10">
                        <NewDesignButton onClick={() => setShowNewChatModal(true)} />
                    </div>
                    <div className="text-[10px] text-foreground/40 font-mono bg-black/60 px-2 py-1 border border-border rounded">
                        VIEW: ISOMETRIC | ZOOM: 100%
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-[80%] h-[60%] border-2 border-accent/30 rounded flex flex-col items-center justify-center bg-accent/5 backdrop-blur-sm relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-full">
                            <svg className="w-full h-full opacity-30" viewBox="0 0 100 100">
                                <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                <path d="M 10 50 L 90 50" fill="none" stroke="currentColor" strokeWidth="0.2" />
                                <path d="M 50 10 L 50 90" fill="none" stroke="currentColor" strokeWidth="0.2" />
                                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                <path d="M 30 30 L 70 70 M 70 30 L 30 70" fill="none" stroke="currentColor" strokeWidth="0.2" />
                            </svg>
                        </div>

                        <VscInbox className="text-4xl text-accent mb-2" />
                        <p className="text-xs text-foreground/60 uppercase tracking-widest font-bold">Awaiting Design</p>
                        <p className="text-[10px] text-foreground/30 font-mono mt-1">Describe your system to begin</p>
                    </motion.div>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-4 text-[8px] text-foreground/40 font-mono">
                    <p>X: 0.00</p>
                    <p>Y: 0.00</p>
                    <p>Z: 0.00</p>
                </div>
            </div>

            <NewChatModal
                isOpen={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                onConfirm={handleConfirmNewChat}
            />
        </div>
    );
};
