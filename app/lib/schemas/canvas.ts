import { z } from "zod";

export const CanvasNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    label: z.string(),
    icon: z.string(),
    nodeType: z.enum(["frontend", "backend", "database", "cache", "queue", "gateway", "service", "external"])
  }),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});

export const CanvasEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional()
});

export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number()
});

export const CanvasDataSchema = z.object({
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
  viewport: ViewportSchema.optional()
});

export type CanvasNode = z.infer<typeof CanvasNodeSchema>;
export type CanvasEdge = z.infer<typeof CanvasEdgeSchema>;
export type Viewport = z.infer<typeof ViewportSchema>;
export type CanvasData = z.infer<typeof CanvasDataSchema>;
