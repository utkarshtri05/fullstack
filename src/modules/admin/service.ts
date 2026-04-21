import { getDb } from "@/db";
import { profiles, subscriptions, users } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

type ListAdminUsersOptions = {
  search?: string;
  role?: "user" | "admin";
  subStatus?: "active" | "past_due" | "canceled" | "incomplete";
};

export async function listAdminUsers(options: ListAdminUsersOptions = {}) {
  const filters = [];

  if (options.search) {
    filters.push(or(ilike(users.email, `%${options.search}%`), ilike(profiles.name, `%${options.search}%`)));
  }

  if (options.role) {
    filters.push(eq(profiles.role, options.role));
  }

  if (options.subStatus) {
    filters.push(eq(subscriptions.status, options.subStatus));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const query = getDb()
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      name: profiles.name,
      role: profiles.role,
      avatarUrl: profiles.avatarUrl,
      subscriptionStatus: subscriptions.status,
      subscriptionPlan: subscriptions.planType
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .orderBy(desc(users.createdAt));

  return whereClause ? query.where(whereClause) : query;
}
