import { getDb } from "@/db";
import { draws, drawResults } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function listDraws() {
  const db = getDb();
  return await db
    .select()
    .from(draws)
    .leftJoin(drawResults, eq(draws.id, drawResults.drawId))
    .orderBy(draws.createdAt);
}

export async function listPublishedDraws() {
  const db = getDb();
  return await db
    .select()
    .from(draws)
    .where(eq(draws.status, "published"));
}


