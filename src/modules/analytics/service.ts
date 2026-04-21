import { getDb } from "@/db";
import { profiles, subscriptions, drawResults, winnerProofs, payouts } from "@/db/schema";
import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";

export async function getAdminMetrics() {
  const db = getDb();
  
  const [userCount] = await db.select({ count: count() }).from(profiles);
  const [activeSubscriptions] = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const [publishedDraws] = await db
    .select({ count: count() })
    .from(drawResults);
  const [pendingProofs] = await db
    .select({ count: count() })
    .from(winnerProofs)
    .where(eq(winnerProofs.status, "pending"));
  const [pendingPayoutCents] = await db
    .select({ total: sql<number>`sum(${payouts.amount})` })
    .from(payouts)
    .where(eq(payouts.status, "pending"));

  // Score series for AdminScoreChart (date/total format)
  const scoreSeries = [
    { date: "2024-01", total: 400 },
    { date: "2024-02", total: 300 },
    { date: "2024-03", total: 500 },
    { date: "2024-04", total: 280 },
  ];

  return {
    userCount: Number(userCount.count),
    activeSubscriptions: Number(activeSubscriptions.count),
    publishedDraws: Number(publishedDraws.count),
    pendingProofs: Number(pendingProofs.count),
    pendingPayoutCents: pendingPayoutCents.total || 0,
    scoreSeries
  };

}

export async function getUserAnalytics(userId: string) {
  return {
    scoreCount: 3,
    charityPercentage: 25,
    pendingPayoutCents: 12500
  };
}


