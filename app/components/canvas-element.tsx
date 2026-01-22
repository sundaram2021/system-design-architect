"use client";

import { useState, useRef } from "react";
import { CanvasView } from "./canvas/canvas-view";
import { NewChatModal } from "./modals/new-chat-modal";
import { useArchitect } from "@/app/lib/context/architect-context";
import { useCanvasExport } from "./canvas/hooks/use-canvas-export";
import { CanvasEmptyState } from "./canvas/canvas-empty-state";
import { CanvasToolbar } from "./canvas/canvas-toolbar";
import { ExportButton } from "./canvas/export-button";

export function CanvasElement() {
    const { canvasNodes, canvasEdges, canvasTitle, updateNodePosition, reset } = useArchitect();
    const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const hasCanvas = canvasNodes.length > 0;

    const { isExporting, handleExport } = useCanvasExport(canvasRef, canvasTitle || 'blueprint');

    const handleNewChat = () => {
        reset();
        setShowNewChatModal(false);
    };

    if (!hasCanvas) {
        return <CanvasEmptyState onNewChat={handleNewChat} />;
    }

    return (
        <div className="w-full h-full p-4">
            <div
                ref={canvasRef}
                className="w-full h-full border border-border bg-black/40 rounded-xl relative overflow-hidden"
            >
                <CanvasToolbar
                    title={canvasTitle || "System Architecture"}
                    nodeCount={canvasNodes.length}
                    edgeCount={canvasEdges.length}
                    onNewDesign={() => setShowNewChatModal(true)}
                />

                <CanvasView
                    initialNodes={canvasNodes}
                    initialEdges={canvasEdges}
                    onNodePositionChange={updateNodePosition}
                />

                <div className="absolute bottom-4 right-4 group z-10">
                    <ExportButton isExporting={isExporting} onClick={handleExport} />
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
