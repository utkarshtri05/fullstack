import { getDb } from "@/db";
import { winnerProofs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function listPendingProofs() {
  const db = getDb();
  return await db
    .select()
    .from(winnerProofs)
    .where(eq(winnerProofs.status, "pending"))
    .orderBy(winnerProofs.id);
}

