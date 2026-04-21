import { getDb } from "@/db";
import {
  auditLogs,
  drawResults,
  draws,
  notifications,
  participants,
  prizes,
  scores,
  subscriptions,
  type Draw,
  type DrawResult
} from "@/db/schema";
import { optionalFloatEnv, optionalIntEnv } from "@/lib/env";
import { and, desc, eq, gt, inArray, ne } from "drizzle-orm";
import { conflict, forbidden, notFound } from "../shared/errors";
import {
  calculatePrizeDistribution,
  classifyWinners,
  countMatches,
  generateWinningNumbers,
  type ParticipantEntry
} from "./engine";
import { drawSimulationSchema, type DrawSimulationInput } from "./schemas";

export type DrawWithResult = Draw & {
  result: DrawResult | null;
};

export function calculateSubscriptionPrizePool(
  planTypes: Array<"monthly" | "yearly">,
  monthlyPlanCents = optionalIntEnv("MONTHLY_PLAN_PRICE_CENTS", 0),
  yearlyPlanCents = optionalIntEnv("YEARLY_PLAN_PRICE_CENTS", 0),
  prizePoolPercent = optionalFloatEnv("PRIZE_POOL_PERCENT", 0.55)
) {
  const eligibleRevenue = planTypes.reduce((total, planType) => {
    if (planType === "yearly") {
      return total + Math.floor(yearlyPlanCents / 12);
    }

    return total + monthlyPlanCents;
  }, 0);

  return Math.max(0, Math.floor(eligibleRevenue * prizePoolPercent));
}

async function getParticipantEntries(tx: any, userIds: string[]) {
  if (userIds.length === 0) {
    return [];
  }

  const rows = await tx
    .select({
      userId: scores.userId,
      score: scores.score,
      date: scores.date,
      createdAt: scores.createdAt
    })
    .from(scores)
    .where(inArray(scores.userId, userIds))
    .orderBy(desc(scores.date), desc(scores.createdAt));

  const grouped = new Map<string, number[]>();

  for (const row of rows) {
    const current = grouped.get(row.userId) ?? [];
    if (current.length < 5) {
      current.push(row.score);
      grouped.set(row.userId, current);
    }
  }

  return [...grouped.entries()].map(([userId, numbers]) => ({
    userId,
    numbers
  }));
}

async function getEligibleParticipants(tx: any) {
  const activeSubscriptions: Array<{ userId: string; planType: "monthly" | "yearly" }> = await tx
    .select({
      userId: subscriptions.userId,
      planType: subscriptions.planType
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, new Date())));

  const entries = await getParticipantEntries(
    tx,
    activeSubscriptions.map((subscription) => subscription.userId)
  );

  return {
    entries,
    planTypes: activeSubscriptions.map((subscription) => subscription.planType)
  };
}

export async function simulateDraw(actorId: string, input: DrawSimulationInput) {
  const values = drawSimulationSchema.parse(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    const [published] = await tx
      .select()
      .from(draws)
      .where(and(eq(draws.month, values.month), eq(draws.year, values.year), eq(draws.status, "published")))
      .limit(1);

    if (published) {
      throw conflict("This draw period has already been published");
    }

    const { entries } = await getEligibleParticipants(tx);
    const winningNumbers = generateWinningNumbers(values.mode, entries.flatMap((entry) => entry.numbers));

    const [draw] = await tx
      .insert(draws)
      .values({
        month: values.month,
        year: values.year,
        mode: values.mode,
        status: "simulated"
      })
      .returning();

    await tx.insert(drawResults).values({
      drawId: draw.id,
      winningNumbers
    });

    if (entries.length > 0) {
      await tx.insert(participants).values(
        entries.map((entry) => ({
          userId: entry.userId,
          drawId: draw.id
        }))
      );
    }

    await tx.insert(auditLogs).values({
      action: "draw.simulated",
      actorId,
      metadata: {
        drawId: draw.id,
        month: draw.month,
        year: draw.year,
        mode: draw.mode,
        winningNumbers,
        participantCount: entries.length
      }
    });

    return {
      draw,
      winningNumbers,
      participantCount: entries.length
    };
  });
}

export async function publishDraw(actorId: string, drawId: string) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [draw] = await tx.select().from(draws).where(eq(draws.id, drawId)).limit(1);

    if (!draw) {
      throw notFound("Draw");
    }

    if (draw.status === "published") {
      throw conflict("This draw has already been published");
    }

    if (draw.status !== "simulated") {
      throw conflict("Draw must be simulated before publishing");
    }

    const [samePeriodPublished] = await tx
      .select()
      .from(draws)
      .where(and(eq(draws.month, draw.month), eq(draws.year, draw.year), eq(draws.status, "published"), ne(draws.id, draw.id)))
      .limit(1);

    if (samePeriodPublished) {
      throw conflict("A draw for this period is already published");
    }

    const [result] = await tx.select().from(drawResults).where(eq(drawResults.drawId, drawId)).limit(1);
    if (!result) {
      throw notFound("Draw result");
    }

    const participantRows = await tx.select().from(participants).where(eq(participants.drawId, drawId));
    const participantEntries = await getParticipantEntries(
      tx,
      participantRows.map((participant) => participant.userId)
    );
    const winners = classifyWinners(participantEntries, result.winningNumbers);
    const { planTypes } = await getEligibleParticipants(tx);
    const totalPoolCents = calculateSubscriptionPrizePool(planTypes);
    const distribution = calculatePrizeDistribution(totalPoolCents, {
      3: winners[3].length,
      4: winners[4].length,
      5: winners[5].length
    });

    await tx.update(draws).set({ status: "published" }).where(eq(draws.id, drawId));

    await tx.insert(prizes).values(
      ([3, 4, 5] as const).map((tier) => ({
        drawId,
        tier,
        totalPool: distribution.tiers[tier].totalPool,
        perWinnerAmount: distribution.tiers[tier].perWinnerAmount
      }))
    );

    if (participantRows.length > 0) {
      await tx.insert(notifications).values(
        participantRows.map((participant) => ({
          userId: participant.userId,
          type: "draw.published",
          message: `Draw ${draw.month}/${draw.year} is now published.`
        }))
      );
    }

    const winnerNotifications = ([3, 4, 5] as const).flatMap((tier) =>
      winners[tier].map((winner) => ({
        userId: winner.userId,
        type: "draw.winner",
        message: `You matched ${tier} numbers. Upload proof to continue the payout flow.`
      }))
    );

    if (winnerNotifications.length > 0) {
      await tx.insert(notifications).values(winnerNotifications);
    }

    await tx.insert(auditLogs).values({
      action: "draw.published",
      actorId,
      metadata: {
        drawId,
        month: draw.month,
        year: draw.year,
        totalPoolCents,
        rolloverCents: distribution.rolloverCents,
        winningNumbers: result.winningNumbers,
        winners: {
          3: winners[3].map((winner) => winner.userId),
          4: winners[4].map((winner) => winner.userId),
          5: winners[5].map((winner) => winner.userId)
        }
      }
    });

    return {
      draw: { ...draw, status: "published" as const },
      result,
      distribution
    };
  });
}

export async function listDraws(): Promise<DrawWithResult[]> {
  const db = getDb();
  const drawRows = await db.select().from(draws).orderBy(desc(draws.createdAt));
  const resultRows = await db.select().from(drawResults);
  const resultByDraw = new Map(resultRows.map((result) => [result.drawId, result]));

  return drawRows.map((draw) => ({
    ...draw,
    result: resultByDraw.get(draw.id) ?? null
  }));
}

export async function listPublishedDraws(): Promise<DrawWithResult[]> {
  const all = await listDraws();
  return all.filter((draw) => draw.status === "published");
}

export async function getWinnerAmountForUser(drawId: string, userId: string) {
  const db = getDb();
  const [draw] = await db.select().from(draws).where(eq(draws.id, drawId)).limit(1);
  const [result] = await db.select().from(drawResults).where(eq(drawResults.drawId, drawId)).limit(1);

  if (!draw || !result || draw.status !== "published") {
    throw forbidden();
  }

  const userScores = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date), desc(scores.createdAt))
    .limit(5);

  const matches = countMatches(
    userScores.map((score) => score.score),
    result.winningNumbers
  );

  if (matches < 3) {
    throw forbidden();
  }

  const [prize] = await db
    .select()
    .from(prizes)
    .where(and(eq(prizes.drawId, drawId), eq(prizes.tier, matches)))
    .limit(1);

  if (!prize) {
    throw notFound("Prize");
  }

  return {
    tier: matches as 3 | 4 | 5,
    amount: prize.perWinnerAmount
  };
}

export function summarizeParticipantMatches(participantsToScore: ParticipantEntry[], winningNumbers: number[]) {
  return participantsToScore.map((participant) => ({
    userId: participant.userId,
    matches: countMatches(participant.numbers, winningNumbers)
  }));
}
