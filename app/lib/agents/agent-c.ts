import { generateWithGemini } from "../services/gemini-service";
import { AGENT_C_SYSTEM_PROMPT } from "./prompts";
import { 
  AgentCCanvasResponseSchema, 
  type Plan,
  type CanvasNode,
  type CanvasEdge
} from "../schemas";

export interface CanvasResult {
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export async function generateCanvas(plan: Plan): Promise<CanvasResult> {
  const planDescription = `
## ARCHITECTURAL PLAN

Title: ${plan.title}
Summary: ${plan.summary}

## COMPONENTS
${plan.components.map((c) => `
- ID: ${c.id}
  Name: ${c.name}
  Type: ${c.type}
  Description: ${c.description}
  Technologies: ${c.technologies.join(", ")}
  Connects to: ${c.connections.join(", ")}
`).join("")}

## DATA FLOW
${plan.dataFlow.map((f) => `- ${f.from} -> ${f.to}`).join("\n")}

Generate the node positions and edges for this architecture. Remember: NO labels on edges.`;

  const response = await generateWithGemini(
    AGENT_C_SYSTEM_PROMPT,
    planDescription,
    { temperature: 0.3 }
  );

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch {
    return generateFallbackLayout(plan);
  }

  const validated = AgentCCanvasResponseSchema.safeParse(parsed);
  
  if (!validated.success) {
    console.error("Agent-C response validation failed:", validated.error);
    return generateFallbackLayout(plan);
  }

  const nodes: CanvasNode[] = validated.data.nodes.map((n) => ({
    id: n.id,
    type: "architectureNode",
    data: {
      label: n.label,
      icon: n.icon,
      nodeType: n.nodeType
    },
    position: { x: n.x, y: n.y }
  }));

  const edges: CanvasEdge[] = validated.data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: true
  }));

  return { 
    title: validated.data.title || plan.title,
    nodes, 
    edges 
  };
}

function generateFallbackLayout(plan: Plan): CanvasResult {
  const typeRows: Record<string, number> = {
    external: 100,
    gateway: 340,
    frontend: 340,
    backend: 580,
    service: 580,
    queue: 820,
    cache: 820,
    database: 820
  };
  
  const iconMap: Record<string, string> = {
    frontend: "FaReact",
    backend: "FaServer",
    database: "FaDatabase",
    cache: "FaBolt",
    queue: "FaLayerGroup",
    gateway: "FaShieldAlt",
    service: "FaCog",
    external: "FaCloud"
  };

  const rowGroups = new Map<number, typeof plan.components>();
  
  plan.components.forEach((c) => {
    const y = typeRows[c.type] || 580;
    if (!rowGroups.has(y)) {
      rowGroups.set(y, []);
    }
    rowGroups.get(y)!.push(c);
  });

  const nodes: CanvasNode[] = [];
  const CANVAS_WIDTH = 1700;
  const SPACING = 340;
  
  rowGroups.forEach((components, y) => {
    const nodeCount = components.length;
    const totalWidth = (nodeCount - 1) * SPACING;
    const startX = (CANVAS_WIDTH - totalWidth) / 2;

    components.forEach((c, index) => {
      nodes.push({
        id: c.id,
        type: "architectureNode",
        data: {
          label: c.name,
          icon: iconMap[c.type] || "FaCog",
          nodeType: c.type as CanvasNode["data"]["nodeType"]
        },
        position: {
          x: startX + index * SPACING,
          y: y
        }
      });
    });
  });

  const edges: CanvasEdge[] = plan.dataFlow.map((f, i) => ({
    id: `edge_${i}`,
    source: f.from,
    target: f.to,
    animated: true
  }));

  return { 
    title: plan.title,
    nodes, 
    edges 
  };
}
