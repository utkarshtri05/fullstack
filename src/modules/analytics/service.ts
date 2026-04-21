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

  // Mock score series for chart
  const scoreSeries = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 300 },
    { name: "Mar", users: 500 },
    { name: "Apr", users: 280 },
  ];

  return {
    userCount: userCount.count,
    activeSubscriptions: activeSubscriptions.count,
    publishedDraws: publishedDraws.count,
    pendingProofs: pendingProofs.count,
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


