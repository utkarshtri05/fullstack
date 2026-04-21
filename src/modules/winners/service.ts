import { getDb } from "@/db";
import { notifications, payouts, winnerProofs } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getWinnerAmountForUser } from "../draws/service";
import { writeAudit } from "../shared/audit";
import { conflict, forbidden, notFound } from "../shared/errors";
import { proofReviewSchema, winnerProofCreateSchema, type ProofReviewInput, type WinnerProofCreateInput } from "./schemas";

export type ProofStatus = "pending" | "approved" | "rejected";
export type PayoutStatus = "pending" | "paid";

export function assertProofTransition(current: ProofStatus, next: ProofStatus) {
  if (current !== "pending") {
    throw conflict("Only pending proofs can be reviewed");
  }

  if (next !== "approved" && next !== "rejected") {
    throw conflict("Proof can only move to approved or rejected");
  }
}

export function assertPayoutTransition(current: PayoutStatus, next: PayoutStatus) {
  if (current !== "pending" || next !== "paid") {
    throw conflict("Payouts can only move from pending to paid");
  }
}

function validateProofStoragePath(userId: string, imageUrl: string) {
  const bucket = process.env.WINNER_PROOF_BUCKET ?? process.env.NEXT_PUBLIC_WINNER_PROOF_BUCKET ?? "winner-proofs";
  const expectedPrefix = `${bucket}/${userId}/`;

  if (!imageUrl.startsWith(expectedPrefix)) {
    throw forbidden();
  }
}

export async function listWinnerCenter(userId: string) {
  const db = getDb();
  const proofs = await db.select().from(winnerProofs).where(eq(winnerProofs.userId, userId)).orderBy(desc(winnerProofs.id));
  const userPayouts = await db.select().from(payouts).where(eq(payouts.userId, userId)).orderBy(desc(payouts.createdAt));

  return {
    proofs,
    payouts: userPayouts
  };
}

export async function listPendingProofs() {
  return getDb()
    .select()
    .from(winnerProofs)
    .where(eq(winnerProofs.status, "pending"))
    .orderBy(desc(winnerProofs.id));
}

export async function submitWinnerProof(userId: string, input: WinnerProofCreateInput) {
  const values = winnerProofCreateSchema.parse(input);
  validateProofStoragePath(userId, values.imageUrl);

  await getWinnerAmountForUser(values.drawId, userId);

  const [existing] = await getDb()
    .select()
    .from(winnerProofs)
    .where(and(eq(winnerProofs.userId, userId), eq(winnerProofs.drawId, values.drawId)))
    .limit(1);

  if (existing) {
    throw conflict("A proof already exists for this draw");
  }

  const [proof] = await getDb()
    .insert(winnerProofs)
    .values({
      userId,
      drawId: values.drawId,
      imageUrl: values.imageUrl,
      status: "pending"
    })
    .returning();

  await writeAudit("winner.proof.submitted", userId, {
    proofId: proof.id,
    drawId: values.drawId
  });

  return proof;
}

export async function approveWinnerProof(actorId: string, proofId: string, input: ProofReviewInput) {
  const values = proofReviewSchema.parse(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    const [proof] = await tx.select().from(winnerProofs).where(eq(winnerProofs.id, proofId)).limit(1);

    if (!proof) {
      throw notFound("Winner proof");
    }

    assertProofTransition(proof.status, "approved");
    const prize = await getWinnerAmountForUser(proof.drawId, proof.userId);

    const [approved] = await tx
      .update(winnerProofs)
      .set({
        status: "approved",
        adminNote: values.adminNote ?? null
      })
      .where(eq(winnerProofs.id, proofId))
      .returning();

    const [payout] = await tx
      .insert(payouts)
      .values({
        userId: proof.userId,
        amount: prize.amount,
        status: "pending"
      })
      .returning();

    await tx.insert(notifications).values({
      userId: proof.userId,
      type: "winner.approved",
      message: `Your ${prize.tier}-match proof was approved. Payout is pending.`
    });

    await writeAudit("winner.proof.approved", actorId, {
      proofId,
      payoutId: payout.id,
      amount: prize.amount
    });

    return {
      proof: approved,
      payout
    };
  });
}

export async function rejectWinnerProof(actorId: string, proofId: string, input: ProofReviewInput) {
  const values = proofReviewSchema.parse(input);
  const [proof] = await getDb().select().from(winnerProofs).where(eq(winnerProofs.id, proofId)).limit(1);

  if (!proof) {
    throw notFound("Winner proof");
  }

  assertProofTransition(proof.status, "rejected");

  const [rejected] = await getDb()
    .update(winnerProofs)
    .set({
      status: "rejected",
      adminNote: values.adminNote ?? null
    })
    .where(eq(winnerProofs.id, proofId))
    .returning();

  await getDb().insert(notifications).values({
    userId: proof.userId,
    type: "winner.rejected",
    message: "Your winner proof was rejected. Review the admin note and upload a valid proof."
  });

  await writeAudit("winner.proof.rejected", actorId, { proofId });
  return rejected;
}

export async function markPayoutPaid(actorId: string, payoutId: string) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [payout] = await tx.select().from(payouts).where(eq(payouts.id, payoutId)).limit(1);

    if (!payout) {
      throw notFound("Payout");
    }

    assertPayoutTransition(payout.status, "paid");

    const [paid] = await tx
      .update(payouts)
      .set({ status: "paid" })
      .where(eq(payouts.id, payoutId))
      .returning();

    await tx.insert(notifications).values({
      userId: payout.userId,
      type: "payout.paid",
      message: "Your payout has been marked paid."
    });

    await writeAudit("payout.paid", actorId, {
      payoutId,
      amount: payout.amount
    });

    return paid;
  });
}
