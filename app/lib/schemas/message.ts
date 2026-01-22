import { z } from "zod";

export const MessageTypeSchema = z.enum([
  "user",
  "system",
  "thinking",
  "research",
  "question", 
  "plan",
  "canvas",
  "review",
  "error"
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

export const BaseMessageSchema = z.object({
  id: z.string(),
  type: MessageTypeSchema,
  timestamp: z.number()
});

export const UserMessageSchema = BaseMessageSchema.extend({
  type: z.literal("user"),
  content: z.string()
});

export const SystemMessageSchema = BaseMessageSchema.extend({
  type: z.literal("system"),
  content: z.string()
});

export const ThinkingMessageSchema = BaseMessageSchema.extend({
  type: z.literal("thinking"),
  agent: z.enum(["agent-a", "agent-b", "agent-c", "agent-d"]),
  status: z.string()
});

export const ResearchSourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string()
});

export const ResearchMessageSchema = BaseMessageSchema.extend({
  type: z.literal("research"),
  query: z.string(),
  sources: z.array(ResearchSourceSchema),
  summary: z.string(),
  isLoading: z.boolean().optional()
});

export const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional()
});

export const QuestionMessageSchema = BaseMessageSchema.extend({
  type: z.literal("question"),
  question: z.string(),
  options: z.array(QuestionOptionSchema),
  allowCustom: z.boolean(),
  allowMultiple: z.boolean().optional(),
  answered: z.boolean().optional()
});

export const PlanComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["frontend", "backend", "database", "cache", "queue", "gateway", "service", "external"]),
  description: z.string(),
  technologies: z.array(z.string()),
  connections: z.array(z.string())
});

export const DataFlowSchema = z.object({
  from: z.string(),
  to: z.string(),
  description: z.string()
});

export const PlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  components: z.array(PlanComponentSchema),
  dataFlow: z.array(DataFlowSchema)
});

export const PlanMessageSchema = BaseMessageSchema.extend({
  type: z.literal("plan"),
  plan: PlanSchema,
  status: z.enum(["pending", "approved", "editing"])
});

export const CanvasMessageSchema = BaseMessageSchema.extend({
  type: z.literal("canvas"),
  status: z.enum(["generating", "complete", "error"]),
  message: z.string().optional()
});

export const ReviewMessageSchema = BaseMessageSchema.extend({
  type: z.literal("review"),
  status: z.enum(["approved", "changes_requested"]),
  title: z.string().optional(),
  feedback: z.string()
});

export const ErrorMessageSchema = BaseMessageSchema.extend({
  type: z.literal("error"),
  message: z.string()
});

export const MessageSchema = z.discriminatedUnion("type", [
  UserMessageSchema,
  SystemMessageSchema,
  ThinkingMessageSchema,
  ResearchMessageSchema,
  QuestionMessageSchema,
  PlanMessageSchema,
  CanvasMessageSchema,
  ReviewMessageSchema,
  ErrorMessageSchema
]);

export type Message = z.infer<typeof MessageSchema>;
export type UserMessage = z.infer<typeof UserMessageSchema>;
export type SystemMessage = z.infer<typeof SystemMessageSchema>;
export type ThinkingMessage = z.infer<typeof ThinkingMessageSchema>;
export type ResearchMessage = z.infer<typeof ResearchMessageSchema>;
export type QuestionMessage = z.infer<typeof QuestionMessageSchema>;
export type PlanMessage = z.infer<typeof PlanMessageSchema>;
export type CanvasMessage = z.infer<typeof CanvasMessageSchema>;
export type ReviewMessage = z.infer<typeof ReviewMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type PlanComponent = z.infer<typeof PlanComponentSchema>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;
