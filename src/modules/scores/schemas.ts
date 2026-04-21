import { z } from "zod";

function validIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime());
}

export const scoreCreateSchema = z.object({
  score: z.coerce.number().int().min(1).max(45),
  date: z.string().refine(validIsoDate, "Date must be in YYYY-MM-DD format")
});

export type ScoreCreateInput = z.infer<typeof scoreCreateSchema>;
