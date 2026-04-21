import { getDb } from "@/db";
import { scores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function listScores(userId: string, limit = 10) {
  const db = getDb();
  return await db
    .select()
    .from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date))
    .limit(limit);
}

