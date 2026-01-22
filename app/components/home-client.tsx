"use client";

import { useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { CanvasArea } from "./canvas-area";
import { ArchitectProvider, useArchitect } from "../lib/context/architect-context";

function HomeContent() {
    const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
    const { canvasNodes, agentState } = useArchitect();

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    let canvasState: 1 | 2 | 3 = 1;

    if (agentState === "generating") {
        canvasState = 2;
    } else if (canvasNodes.length > 0) {
        canvasState = 3;
    }

    return (
        <main className="relative flex h-screen w-screen bg-background architect-grid overflow-hidden">
            <ChatSidebar
                isVisible={isSidebarVisible}
                onToggle={toggleSidebar}
            />

            <div className="relative flex-1 h-full overflow-hidden">
                <CanvasArea state={canvasState} />
            </div>
        </main>
    );
}

export function HomeClient() {
    return (
        <ArchitectProvider>
            <HomeContent />
        </ArchitectProvider>
    );
}
