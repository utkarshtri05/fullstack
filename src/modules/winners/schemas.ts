import { z } from "zod";

export const winnerProofCreateSchema = z.object({
  drawId: z.string().uuid(),
  imageUrl: z.string().trim().min(8).max(2048)
});

export const proofReviewSchema = z.object({
  adminNote: z.string().trim().max(1000).optional()
});

export type WinnerProofCreateInput = z.infer<typeof winnerProofCreateSchema>;
export type ProofReviewInput = z.infer<typeof proofReviewSchema>;
