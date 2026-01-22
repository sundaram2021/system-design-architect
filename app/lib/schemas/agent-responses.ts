import { z } from "zod";

export const AgentBQuestionResponseSchema = z.object({
  type: z.literal("question"),
  data: z.object({
    id: z.string(),
    question: z.string(),
    context: z.string().optional(),
    options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional()
    })),
    allowCustom: z.boolean(),
    allowMultiple: z.boolean().optional()
  })
});

export const ResearchQuerySchema = z.object({
  query: z.string(),
  purpose: z.string()
});

export const AgentBResearchRequestSchema = z.object({
  type: z.literal("research_needed"),
  data: z.object({
    queries: z.array(ResearchQuerySchema).optional(),
    query: z.string().optional(),
    context: z.string(),
    purpose: z.string().optional()
  })
});

export const AgentBPlanResponseSchema = z.object({
  type: z.literal("plan"),
  data: z.object({
    title: z.string(),
    summary: z.string(),
    components: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["frontend", "backend", "database", "cache", "queue", "gateway", "service", "external"]),
      description: z.string(),
      technologies: z.array(z.string()),
      connections: z.array(z.string())
    })),
    dataFlow: z.array(z.object({
      from: z.string(),
      to: z.string(),
      description: z.string()
    }))
  })
});

export const AgentBThinkingResponseSchema = z.object({
  type: z.literal("thinking"),
  data: z.object({
    status: z.string()
  })
});

export const AgentBResponseSchema = z.discriminatedUnion("type", [
  AgentBQuestionResponseSchema,
  AgentBResearchRequestSchema,
  AgentBPlanResponseSchema,
  AgentBThinkingResponseSchema
]);

export const AgentCCanvasResponseSchema = z.object({
  title: z.string().optional(),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string(),
    nodeType: z.enum(["frontend", "backend", "database", "cache", "queue", "gateway", "service", "external"]),
    x: z.number(),
    y: z.number()
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string()
  }))
});

export const AgentDReviewResponseSchema = z.object({
  status: z.enum(["approved", "changes_requested"]),
  title: z.string().describe("Short 3-6 word summary of the critique or approval (e.g. 'Missing Authentication Layer'). Required."),
  feedback: z.string().describe("Detailed feedback if changes are needed, or approval remarks. Must address Agent-B directly.")
});

export const AgentAResearchResultSchema = z.object({
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string()
  })),
  summary: z.string(),
  recommendation: z.string()
});

export type AgentBQuestionResponse = z.infer<typeof AgentBQuestionResponseSchema>;
export type AgentBResearchRequest = z.infer<typeof AgentBResearchRequestSchema>;
export type AgentBPlanResponse = z.infer<typeof AgentBPlanResponseSchema>;
export type AgentBResponse = z.infer<typeof AgentBResponseSchema>;
export type AgentCCanvasResponse = z.infer<typeof AgentCCanvasResponseSchema>;
export type AgentDReviewResponse = z.infer<typeof AgentDReviewResponseSchema>;
export type AgentAResearchResult = z.infer<typeof AgentAResearchResultSchema>;
export type ResearchQuery = z.infer<typeof ResearchQuerySchema>;
