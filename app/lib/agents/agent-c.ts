import { generateWithHaiku } from "../services/ai-service";
import { parseJsonSafely } from "../services/json-parser";
import { AGENT_C_SYSTEM_PROMPT } from "./prompts";
import { AgentCCanvasResponseSchema, type AgentCCanvasResponse } from "../schemas/agent-responses";
import type { Plan } from "../schemas/message";
import type { CanvasNode, CanvasEdge } from "../schemas/canvas";

export interface CanvasResult {
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const TYPE_ROWS: Record<string, number> = {
  external: 100,
  gateway: 340,
  frontend: 340,
  backend: 580,
  service: 580,
  queue: 820,
  cache: 820,
  database: 820
};

const ICON_MAP: Record<string, string> = {
  frontend: "FaReact",
  backend: "FaServer",
  database: "FaDatabase",
  cache: "FaBolt",
  queue: "FaLayerGroup",
  gateway: "FaShieldAlt",
  service: "FaCog",
  external: "FaCloud"
};

function ensureCompleteCanvas(plan: Plan, rawNodes: CanvasNode[], rawEdges: CanvasEdge[]): CanvasResult {
  const nodeMap = new Map<string, CanvasNode>();
  rawNodes.forEach((n) => nodeMap.set(n.id, n));

  // Auto-inject any component Claude may have omitted
  plan.components.forEach((c, idx) => {
    if (!nodeMap.has(c.id)) {
      const y = TYPE_ROWS[c.type] || 580;
      nodeMap.set(c.id, {
        id: c.id,
        type: "architectureNode",
        data: {
          label: c.name,
          icon: ICON_MAP[c.type] || "FaCog",
          nodeType: c.type as CanvasNode["data"]["nodeType"]
        },
        position: { x: 250 + (idx * 280) % 1200, y }
      });
    }
  });

  const allNodes = Array.from(nodeMap.values());
  const validIds = new Set(allNodes.map((n) => n.id));

  // Filter edges to ensure both source and target exist
  const validEdges = rawEdges
    .filter((e) => validIds.has(e.source) && validIds.has(e.target))
    .map((e, i) => ({
      id: e.id || `edge_${i}`,
      source: e.source,
      target: e.target,
      animated: true
    }));

  return { title: plan.title, nodes: allNodes, edges: validEdges };
}

export async function generateCanvas(plan: Plan): Promise<CanvasResult> {
  const planDescription = `
## ARCHITECTURAL PLAN
Title: ${plan.title}
Summary: ${plan.summary}

## COMPONENTS
${plan.components.map((c) => `- ID: ${c.id}\n  Name: ${c.name}\n  Type: ${c.type}\n  Description: ${c.description}\n  Technologies: ${c.technologies.join(", ")}\n  Connects to: ${c.connections.join(", ")}`).join("\n")}

## DATA FLOW
${plan.dataFlow.map((f) => `- ${f.from} -> ${f.to}`).join("\n")}

Generate realistic, uncluttered node positions and edges for this architecture. NO labels on edges.`;

  try {
    const response = await generateWithHaiku(AGENT_C_SYSTEM_PROMPT, planDescription, { temperature: 0.2 });
    const parsed = parseJsonSafely<AgentCCanvasResponse>(response, AgentCCanvasResponseSchema);

    if (parsed.success) {
      const nodes: CanvasNode[] = parsed.data.nodes.map((n) => ({
        id: n.id,
        type: "architectureNode",
        data: { label: n.label, icon: n.icon, nodeType: n.nodeType },
        position: { x: Math.max(50, Math.min(1600, n.x)), y: Math.max(50, Math.min(1000, n.y)) }
      }));

      const edges: CanvasEdge[] = parsed.data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true
      }));

      return ensureCompleteCanvas(plan, nodes, edges);
    }
  } catch (err) {
    console.error("Agent-C generation failed, using fallback layout:", err);
  }

  return generateFallbackLayout(plan);
}

function generateFallbackLayout(plan: Plan): CanvasResult {
  const rowGroups = new Map<number, typeof plan.components>();

  plan.components.forEach((c) => {
    const y = TYPE_ROWS[c.type] || 580;
    if (!rowGroups.has(y)) rowGroups.set(y, []);
    rowGroups.get(y)!.push(c);
  });

  const nodes: CanvasNode[] = [];
  const CANVAS_WIDTH = 1700;
  const SPACING = 340;

  rowGroups.forEach((components, y) => {
    const totalWidth = (components.length - 1) * SPACING;
    const startX = (CANVAS_WIDTH - totalWidth) / 2;

    components.forEach((c, index) => {
      nodes.push({
        id: c.id,
        type: "architectureNode",
        data: {
          label: c.name,
          icon: ICON_MAP[c.type] || "FaCog",
          nodeType: c.type as CanvasNode["data"]["nodeType"]
        },
        position: { x: startX + index * SPACING, y }
      });
    });
  });

  const edges: CanvasEdge[] = plan.dataFlow.map((f, i) => ({
    id: `edge_${i}`,
    source: f.from,
    target: f.to,
    animated: true
  }));

  return { title: plan.title, nodes, edges };
}
