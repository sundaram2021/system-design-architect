"use client";

import { useCallback, useMemo } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type OnNodesChange,
    type NodeTypes,
    type EdgeTypes
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArchitectureNode } from "./architecture-node";
import { ArchitectureEdge } from "./architecture-edge";
import type { CanvasNode, CanvasEdge } from "@/app/lib/schemas/canvas";

interface CanvasViewProps {
    initialNodes: CanvasNode[];
    initialEdges: CanvasEdge[];
    onNodePositionChange?: (id: string, position: { x: number; y: number }) => void;
}

const nodeTypes: NodeTypes = {
    architectureNode: ArchitectureNode
};

const edgeTypes: EdgeTypes = {
    default: ArchitectureEdge
};

export function CanvasView({
    initialNodes,
    initialEdges,
    onNodePositionChange
}: CanvasViewProps) {
    const nodes: Node[] = useMemo(() =>
        initialNodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data
        })),
        [initialNodes]
    );

    const edges: Edge[] = useMemo(() =>
        initialEdges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: e.animated,
            type: "default"
        })),
        [initialEdges]
    );

    const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
    const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

    const handleNodesChange: OnNodesChange = useCallback((changes) => {
        onNodesChange(changes);

        changes.forEach((change) => {
            if (change.type === "position" && change.position && onNodePositionChange) {
                onNodePositionChange(change.id, change.position);
            }
        });
    }, [onNodesChange, onNodePositionChange]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodesState}
                edges={edgesState}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={2}
                defaultEdgeOptions={{
                    animated: true,
                    type: "default"
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    color="rgba(255, 255, 255, 0.03)"
                    gap={40}
                    size={1}
                />
                <Controls
                    className="!bg-sidebar !border-border !rounded-lg !shadow-lg"
                    showInteractive={false}
                />
            </ReactFlow>
        </div>
    );
}
