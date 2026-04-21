import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const profileRoleEnum = pgEnum("profile_role", ["user", "admin"]);
export const planTypeEnum = pgEnum("plan_type", ["monthly", "yearly"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "incomplete"
]);
export const drawModeEnum = pgEnum("draw_mode", ["random", "weighted", "hybrid"]);
export const drawStatusEnum = pgEnum("draw_status", ["draft", "simulated", "published"]);
export const proofStatusEnum = pgEnum("proof_status", ["pending", "approved", "rejected"]);
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "paid"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: profileRoleEnum("role").notNull().default("user"),
    avatarUrl: text("avatar_url")
  },
  (table) => ({
    userIdUnique: uniqueIndex("profiles_user_id_unique").on(table.userId)
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    planType: planTypeEnum("plan_type").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull()
  },
  (table) => ({
    userIdUnique: uniqueIndex("subscriptions_user_id_unique").on(table.userId),
    customerUnique: uniqueIndex("subscriptions_customer_unique").on(table.stripeCustomerId),
    subscriptionUnique: uniqueIndex("subscriptions_subscription_unique").on(table.stripeSubscriptionId)
  })
);

export const scores = pgTable(
  "scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    userDateUnique: uniqueIndex("scores_user_date_unique").on(table.userId, table.date),
    scoreRange: check("scores_score_range", sql`${table.score} between 1 and 45`)
  })
);

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  mode: drawModeEnum("mode").notNull(),
  status: drawStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const drawResults = pgTable(
  "draw_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    drawId: uuid("draw_id")
      .notNull()
      .references(() => draws.id, { onDelete: "cascade" }),
    winningNumbers: integer("winning_numbers").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    drawIdUnique: uniqueIndex("draw_results_draw_id_unique").on(table.drawId)
  })
);

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    drawId: uuid("draw_id")
      .notNull()
      .references(() => draws.id, { onDelete: "cascade" })
  },
  (table) => ({
    userDrawUnique: uniqueIndex("participants_user_draw_unique").on(table.userId, table.drawId)
  })
);

export const prizes = pgTable(
  "prizes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    drawId: uuid("draw_id")
      .notNull()
      .references(() => draws.id, { onDelete: "cascade" }),
    tier: integer("tier").notNull(),
    totalPool: integer("total_pool").notNull(),
    perWinnerAmount: integer("per_winner_amount").notNull()
  },
  (table) => ({
    drawTierUnique: uniqueIndex("prizes_draw_tier_unique").on(table.drawId, table.tier),
    tierRange: check("prizes_tier_range", sql`${table.tier} in (3, 4, 5)`),
    nonNegativePool: check("prizes_total_pool_non_negative", sql`${table.totalPool} >= 0`),
    nonNegativePerWinner: check("prizes_per_winner_non_negative", sql`${table.perWinnerAmount} >= 0`)
  })
);

export const charities = pgTable("charities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false)
});

export const userCharity = pgTable(
  "user_charity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    charityId: uuid("charity_id")
      .notNull()
      .references(() => charities.id, { onDelete: "cascade" }),
    percentage: integer("percentage").notNull()
  },
  (table) => ({
    userCharityUnique: uniqueIndex("user_charity_user_charity_unique").on(table.userId, table.charityId),
    percentageMinimum: check("user_charity_percentage_minimum", sql`${table.percentage} >= 10`),
    percentageMaximum: check("user_charity_percentage_maximum", sql`${table.percentage} <= 100`)
  })
);

export const winnerProofs = pgTable("winner_proofs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  drawId: uuid("draw_id")
    .notNull()
    .references(() => draws.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  status: proofStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note")
});

export const payouts = pgTable("payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false)
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: text("action").notNull(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type Draw = typeof draws.$inferSelect;
export type DrawResult = typeof drawResults.$inferSelect;
export type Prize = typeof prizes.$inferSelect;
export type Charity = typeof charities.$inferSelect;
export type UserCharity = typeof userCharity.$inferSelect;
export type WinnerProof = typeof winnerProofs.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
