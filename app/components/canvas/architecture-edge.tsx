"use client";

import { memo } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

function ArchitectureEdgeComponent({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 16
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    stroke: "rgba(245, 158, 11, 0.15)",
                    strokeWidth: 8,
                    filter: "blur(4px)"
                }}
            />
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: "rgba(245, 158, 11, 0.6)",
                    strokeWidth: 2
                }}
            />
        </>
    );
}

export const ArchitectureEdge = memo(ArchitectureEdgeComponent);
