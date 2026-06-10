import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
  description: z.string().optional(),
  status: z.enum(["lead", "active", "completed", "archived"]).optional(),
  currency: z.string().optional(),
  deadline: z.string().optional().or(z.literal("")), // HTML date input returns string
});

export type ProjectFormData = z.infer<typeof ProjectSchema>;
