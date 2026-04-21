import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  avatarUrl: z.string().trim().url().max(2048).nullable().optional()
});

export const authFormSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
