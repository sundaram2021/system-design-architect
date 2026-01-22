"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { VscInbox, VscAdd, VscLoading } from "react-icons/vsc";
import { toPng } from "html-to-image";
import { CanvasView } from "./canvas";
import { NewChatModal } from "./modals/new-chat-modal";
import { useArchitect } from "@/app/lib/context/architect-context";

export function CanvasElement() {
    const { canvasNodes, canvasEdges, canvasTitle, updateNodePosition, reset } = useArchitect();
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const hasCanvas = canvasNodes.length > 0;

    const handleNewChat = () => {
        reset();
        setShowNewChatModal(false);
    };

    const handleExport = useCallback(async () => {
        if (!canvasRef.current) return;

        try {
            setIsExporting(true);
            const dataUrl = await toPng(canvasRef.current, {
                cacheBust: true,
                filter: (node) => {
                    // Exclude buttons from the export
                    if (node.tagName === 'BUTTON') return false;
                    return true;
                },
                backgroundColor: '#000000' // Ensure dark background is captured
            });

            const link = document.createElement('a');
            link.download = `${canvasTitle?.toLowerCase().replace(/\s+/g, '-') || 'blueprint'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    }, [canvasTitle]);

    const NewDesignButton = () => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-sidebar/80 border border-border rounded-lg hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group backdrop-blur-sm"
        >
            <VscAdd className="text-base text-amber-400 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-[10px] text-foreground/70 font-medium uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                New Design
            </span>
        </motion.button>
    );

    if (!hasCanvas) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="w-full h-full border border-border bg-black/40 rounded-xl relative overflow-hidden architect-grid">
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <div className="z-10">
                            <NewDesignButton />
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
                    onConfirm={handleNewChat}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4">
            <div
                ref={canvasRef}
                className="w-full h-full border border-border bg-black/40 rounded-xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                    <div className="flex justify-center pt-6">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-8 py-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-lg backdrop-blur-md"
                        >
                            <h1 className="text-xl font-bold text-amber-400 tracking-wide text-center">
                                {canvasTitle || "System Architecture"}
                            </h1>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute top-4 left-4 z-10">
                    <NewDesignButton />
                </div>

                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                    <div className="text-[10px] text-foreground/40 font-mono bg-black/60 px-2 py-1 border border-border rounded backdrop-blur-sm">
                        NODES: {canvasNodes.length} | EDGES: {canvasEdges.length}
                    </div>
                </div>

                <CanvasView
                    initialNodes={canvasNodes}
                    initialEdges={canvasEdges}
                    onNodePositionChange={updateNodePosition}
                />

                <div className="absolute bottom-4 right-4 group z-10">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 text-[10px] text-accent font-bold tracking-widest bg-accent/10 px-4 py-2 border border-accent/20 rounded hover:bg-accent hover:text-background transition-all backdrop-blur-sm disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <VscLoading className="animate-spin text-sm" />
                                EXPORTING...
                            </>
                        ) : (
                            "EXPORT BLUEPRINT"
                        )}
                    </button>
                </div>
            </div>

            <NewChatModal
                isOpen={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                onConfirm={handleNewChat}
            />
        </div>
    );
}
