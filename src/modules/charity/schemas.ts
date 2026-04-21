import { z } from "zod";

export const charityAllocationSchema = z.object({
  charityId: z.string().uuid(),
  percentage: z.coerce.number().int().min(10).max(100)
});

export const charityAllocationsUpdateSchema = z.object({
  allocations: z.array(charityAllocationSchema).max(10).refine(
    (allocations) => {
      const ids = new Set(allocations.map((allocation) => allocation.charityId));
      return ids.size === allocations.length;
    },
    { message: "Each charity can only be allocated once" }
  ).refine(
    (allocations) => allocations.reduce((sum, allocation) => sum + allocation.percentage, 0) <= 100,
    { message: "Total charity allocation cannot exceed 100%" }
  )
});

export const charityUpsertSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1000),
  imageUrl: z.string().trim().url().max(2048),
  isFeatured: z.coerce.boolean().default(false)
});

export type CharityAllocationsUpdateInput = z.infer<typeof charityAllocationsUpdateSchema>;
export type CharityUpsertInput = z.infer<typeof charityUpsertSchema>;
