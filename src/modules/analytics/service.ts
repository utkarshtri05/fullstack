import { getDb } from "@/db";
import { draws, payouts, scores, subscriptions, userCharity, users, winnerProofs } from "@/db/schema";
import { and, count, eq, sum } from "drizzle-orm";

export async function getUserAnalytics(userId: string) {
  const db = getDb();
  const [scoreCount] = await db.select({ value: count() }).from(scores).where(eq(scores.userId, userId));
  const [charityAllocation] = await db.select({ value: sum(userCharity.percentage) }).from(userCharity).where(eq(userCharity.userId, userId));
  const [pendingPayouts] = await db
    .select({ value: sum(payouts.amount) })
    .from(payouts)
    .where(and(eq(payouts.userId, userId), eq(payouts.status, "pending")));

  return {
    scoreCount: scoreCount?.value ?? 0,
    charityPercentage: Number(charityAllocation?.value ?? 0),
    pendingPayoutCents: Number(pendingPayouts?.value ?? 0)
  };
}

export async function getAdminMetrics() {
  const db = getDb();
  const [userCount] = await db.select({ value: count() }).from(users);
  const [activeSubscriptions] = await db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, "active"));
  const [publishedDraws] = await db.select({ value: count() }).from(draws).where(eq(draws.status, "published"));
  const [pendingProofs] = await db.select({ value: count() }).from(winnerProofs).where(eq(winnerProofs.status, "pending"));
  const [pendingPayouts] = await db.select({ value: sum(payouts.amount) }).from(payouts).where(eq(payouts.status, "pending"));

  const scoreSeriesRows = await db
    .select({
      date: scores.date,
      total: count()
    })
    .from(scores)
    .groupBy(scores.date)
    .orderBy(scores.date);

  return {
    userCount: userCount?.value ?? 0,
    activeSubscriptions: activeSubscriptions?.value ?? 0,
    publishedDraws: publishedDraws?.value ?? 0,
    pendingProofs: pendingProofs?.value ?? 0,
    pendingPayoutCents: Number(pendingPayouts?.value ?? 0),
    scoreSeries: scoreSeriesRows.map((row) => ({
      date: row.date,
      total: row.total
    }))
  };
}
