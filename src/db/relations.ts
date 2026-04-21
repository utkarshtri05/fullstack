import { relations } from "drizzle-orm";
import {
  auditLogs,
  charities,
  drawResults,
  draws,
  notifications,
  participants,
  payouts,
  prizes,
  profiles,
  scores,
  subscriptions,
  userCharity,
  users,
  winnerProofs
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  profile: one(profiles),
  subscription: one(subscriptions),
  scores: many(scores),
  participants: many(participants),
  charities: many(userCharity),
  winnerProofs: many(winnerProofs),
  payouts: many(payouts),
  notifications: many(notifications),
  auditLogs: many(auditLogs)
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id]
  })
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  })
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, {
    fields: [scores.userId],
    references: [users.id]
  })
}));

export const drawsRelations = relations(draws, ({ many, one }) => ({
  result: one(drawResults),
  participants: many(participants),
  prizes: many(prizes),
  winnerProofs: many(winnerProofs)
}));

export const drawResultsRelations = relations(drawResults, ({ one }) => ({
  draw: one(draws, {
    fields: [drawResults.drawId],
    references: [draws.id]
  })
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  user: one(users, {
    fields: [participants.userId],
    references: [users.id]
  }),
  draw: one(draws, {
    fields: [participants.drawId],
    references: [draws.id]
  })
}));

export const prizesRelations = relations(prizes, ({ one }) => ({
  draw: one(draws, {
    fields: [prizes.drawId],
    references: [draws.id]
  })
}));

export const charitiesRelations = relations(charities, ({ many }) => ({
  users: many(userCharity)
}));

export const userCharityRelations = relations(userCharity, ({ one }) => ({
  user: one(users, {
    fields: [userCharity.userId],
    references: [users.id]
  }),
  charity: one(charities, {
    fields: [userCharity.charityId],
    references: [charities.id]
  })
}));

export const winnerProofsRelations = relations(winnerProofs, ({ one }) => ({
  user: one(users, {
    fields: [winnerProofs.userId],
    references: [users.id]
  }),
  draw: one(draws, {
    fields: [winnerProofs.drawId],
    references: [draws.id]
  })
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, {
    fields: [payouts.userId],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id]
  })
}));
