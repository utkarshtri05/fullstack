import { getDb } from "@/db";
import { scores, type Score } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { conflict, notFound } from "../shared/errors";
import { scoreCreateSchema, type ScoreCreateInput } from "./schemas";

export const SCORE_LIMIT = 5;

type ScoreWindowItem = Pick<Score, "id" | "date" | "createdAt">;

export function sortScoresLatestFirst<T extends ScoreWindowItem>(items: T[]) {
  return [...items].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) {
      return byDate;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function selectScoresToPrune<T extends ScoreWindowItem>(items: T[], limit = SCORE_LIMIT) {
  return sortScoresLatestFirst(items).slice(limit);
}

export function assertNoDuplicateScoreDate(items: Pick<Score, "date">[], date: string) {
  if (items.some((item) => item.date === date)) {
    throw conflict("A score already exists for this date");
  }
}

export async function listScores(userId: string, limit = SCORE_LIMIT) {
  return getDb()
    .select()
    .from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date), desc(scores.createdAt))
    .limit(limit);
}

export async function createScore(userId: string, input: ScoreCreateInput) {
  const values = scoreCreateSchema.parse(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.date), desc(scores.createdAt));

    assertNoDuplicateScoreDate(existing, values.date);

    await tx.insert(scores).values({
      userId,
      score: values.score,
      date: values.date
    });

    const updated = await tx
      .select()
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.date), desc(scores.createdAt));

    const toPrune = selectScoresToPrune(updated);

    if (toPrune.length > 0) {
      await tx.delete(scores).where(inArray(scores.id, toPrune.map((score) => score.id)));
    }

    return tx
      .select()
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.date), desc(scores.createdAt))
      .limit(SCORE_LIMIT);
  });
}

export async function deleteScore(userId: string, scoreId: string) {
  const [deleted] = await getDb()
    .delete(scores)
    .where(and(eq(scores.id, scoreId), eq(scores.userId, userId)))
    .returning();

  if (!deleted) {
    throw notFound("Score");
  }

  return deleted;
}
