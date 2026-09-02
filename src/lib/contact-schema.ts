import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer"),
  company: z
    .string()
    .trim()
    .max(160, "Company must be 160 characters or fewer"),
  role: z
    .string()
    .trim()
    .max(160, "Role must be 160 characters or fewer"),
  where_met: z
    .string()
    .trim()
    .max(240, "Where you met must be 240 characters or fewer"),
  notes: z
    .string()
    .trim()
    .max(2_000, "Notes must be 2,000 characters or fewer"),
  priority: z.enum(["high", "medium", "low"], {
    message: "Priority must be high, medium, or low",
  }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const emptyContactForm: ContactFormValues = {
  name: "",
  company: "",
  role: "",
  where_met: "",
  notes: "",
  priority: "medium",
};

export function nullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
