"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
    FaReact,
    FaServer,
    FaDatabase,
    FaBolt,
    FaLayerGroup,
    FaShieldAlt,
    FaCog,
    FaCloud
} from "react-icons/fa";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaReact,
    FaServer,
    FaDatabase,
    FaBolt,
    FaLayerGroup,
    FaShieldAlt,
    FaCog,
    FaCloud
};

const typeColors: Record<string, string> = {
    frontend: "from-amber-500/20 to-amber-600/10 border-amber-500/40",
    backend: "from-amber-600/20 to-amber-700/10 border-amber-600/40",
    database: "from-amber-700/20 to-amber-800/10 border-amber-700/40",
    cache: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/40",
    queue: "from-orange-500/20 to-orange-600/10 border-orange-500/40",
    gateway: "from-amber-400/20 to-amber-500/10 border-amber-400/40",
    service: "from-amber-500/20 to-amber-600/10 border-amber-500/40",
    external: "from-amber-300/20 to-amber-400/10 border-amber-300/40"
};

interface ArchitectureNodeData extends Record<string, unknown> {
    label: string;
    icon: string;
    nodeType: string;
}

type ArchitectureNode = Node<ArchitectureNodeData>;

function ArchitectureNodeComponent({ data }: NodeProps<ArchitectureNode>) {
    const nodeData = data;
    const IconComponent = iconMap[nodeData.icon] || FaCog;
    const colorClass = typeColors[nodeData.nodeType] || typeColors.service;

    return (
        <div className={`
      relative px-6 py-4 min-w-[140px]
      bg-gradient-to-br ${colorClass}
      border rounded-xl
      shadow-lg shadow-amber-500/5
      backdrop-blur-sm
      transition-all duration-200
      hover:shadow-amber-500/20 hover:scale-105
      cursor-grab active:cursor-grabbing
    `}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-amber-300"
            />

            <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-lg bg-black/20">
                    <IconComponent className="text-2xl text-amber-400" />
                </div>
                <p className="text-xs text-foreground font-medium text-center leading-tight">
                    {nodeData.label}
                </p>
                <p className="text-[8px] text-amber-400/60 uppercase tracking-widest">
                    {nodeData.nodeType}
                </p>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-amber-300"
            />

            <div className="absolute inset-0 rounded-xl border border-amber-500/10 pointer-events-none" />
            <div className="absolute -inset-0.5 rounded-xl bg-amber-500/5 blur-sm -z-10" />
        </div>
    );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent);
