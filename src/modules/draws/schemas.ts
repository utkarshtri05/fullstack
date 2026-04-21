import { z } from "zod";

export const drawModeSchema = z.enum(["random", "weighted", "hybrid"]);

export const drawSimulationSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2024).max(2100),
  mode: drawModeSchema
});

export type DrawMode = z.infer<typeof drawModeSchema>;
export type DrawSimulationInput = z.infer<typeof drawSimulationSchema>;
