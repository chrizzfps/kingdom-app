import { z } from "zod";

export const ClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  commercialName: z.string().optional(),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  taxId: z.string().optional(),
  legalName: z.string().optional(),
  fiscalAddress: z.string().optional(),
  status: z.enum(["active", "inactive", "lead"]).optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof ClientSchema>;
