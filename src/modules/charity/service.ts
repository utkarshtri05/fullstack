import { getDb } from "@/db";
import { charities, userCharity } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { writeAudit } from "../shared/audit";
import { notFound } from "../shared/errors";
import {
  charityAllocationsUpdateSchema,
  charityUpsertSchema,
  type CharityAllocationsUpdateInput,
  type CharityUpsertInput
} from "./schemas";

export async function listCharities() {
  return getDb().select().from(charities).orderBy(asc(charities.name));
}

export async function listUserCharityAllocations(userId: string) {
  return getDb().select().from(userCharity).where(eq(userCharity.userId, userId));
}

export async function updateUserCharityAllocations(userId: string, input: CharityAllocationsUpdateInput) {
  const values = charityAllocationsUpdateSchema.parse(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    if (values.allocations.length > 0) {
      const knownCharities = await tx
        .select({ id: charities.id })
        .from(charities)
        .where(inArray(charities.id, values.allocations.map((allocation) => allocation.charityId)));

      if (knownCharities.length !== values.allocations.length) {
        throw notFound("Charity");
      }
    }

    await tx.delete(userCharity).where(eq(userCharity.userId, userId));

    if (values.allocations.length > 0) {
      await tx.insert(userCharity).values(
        values.allocations.map((allocation) => ({
          userId,
          charityId: allocation.charityId,
          percentage: allocation.percentage
        }))
      );
    }

    await writeAudit("charity.allocations.updated", userId, {
      allocations: values.allocations
    });

    return tx.select().from(userCharity).where(eq(userCharity.userId, userId));
  });
}

export async function createCharity(actorId: string, input: CharityUpsertInput) {
  const values = charityUpsertSchema.parse(input);
  const [charity] = await getDb().insert(charities).values(values).returning();

  await writeAudit("charity.created", actorId, { charityId: charity.id });
  return charity;
}

export async function updateCharity(actorId: string, charityId: string, input: CharityUpsertInput) {
  const values = charityUpsertSchema.parse(input);
  const [charity] = await getDb()
    .update(charities)
    .set(values)
    .where(eq(charities.id, charityId))
    .returning();

  if (!charity) {
    throw notFound("Charity");
  }

  await writeAudit("charity.updated", actorId, { charityId });
  return charity;
}
