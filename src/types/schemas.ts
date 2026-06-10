import { z } from "zod";

// Basic types based on proposal.ts
export const ModuleTypeSchema = z.enum([
  "hero", "intro", "text", "options", "pricing",
  "timeline", "cta", "references", "portfolio-hero",
  "portfolio-cta", "project-grid"
]);

export const ProposalStatusSchema = z.enum([
  "draft", "published", "archived", "accepted", "rejected"
]);

export const ModuleSchema = z.object({
  id: z.string().uuid(),
  type: ModuleTypeSchema,
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  data: z.record(z.string(), z.any()), // Specific validation per module can be added later
});

export const ProposalSchema = z.object({
  id: z.string(),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientLogoUrl: z.string().url().optional().or(z.literal("")),
  status: ProposalStatusSchema,
  createdAt: z.any(), // Firebase Timestamp or Date
  updatedAt: z.any(),
  currency: z.string().default("USD"),
  modules: z.array(ModuleSchema),
});

export const HeroModuleSchema = z.object({
  title: z.string().min(3, "El título es muy corto").max(120, "Máximo 120 caracteres"),
  subtitle: z.string().max(160, "Máximo 160 caracteres").optional(),
  backgroundImageUrl: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  backgroundPosition: z.object({ x: z.number(), y: z.number() }).optional(),
  backgroundGradient: z.object({ colors: z.array(z.string()), angle: z.number(), animate: z.boolean().optional() }).optional(),
  buttonText: z.string().max(30, "Texto muy largo").optional(),
  showLogo: z.boolean().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  overlay: z.number().min(0).max(100).optional(),
  blurLevel: z.number().min(0).max(20).optional(),
  animate: z.boolean().optional(),
});

export type HeroModuleData = z.infer<typeof HeroModuleSchema>;

export type ProposalSchemaType = z.infer<typeof ProposalSchema>;

