import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { users, profiles, subscriptions } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';
import { requireAdmin } from '@/modules/auth/server';
import { writeAudit } from '@/modules/shared/audit';
import { z } from 'zod';

const searchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  subStatus: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  page: z.coerce.number().min(0).optional().default(0),
});

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const validated = searchSchema.parse({
    search: searchParams.get('search'),
    role: searchParams.get('role') as any,
    subStatus: searchParams.get('subStatus'),
    limit: searchParams.get('limit'),
    page: searchParams.get('page'),
  });

  const db = getDb();
  const offset = validated.page * validated.limit;

  // Base query with users + profiles join
  const userQuery = db
    .select({
      id: users.id,
      email: users.email,
      name: profiles.name,
      role: profiles.role,
      createdAt: users.createdAt,
      subscriptionStatus: subscriptions.status,
      subscriptionPlan: subscriptions.planType,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .orderBy(desc(users.createdAt));

  // Apply filters
  if (validated.search) {
    userQuery.where(
      like(users.email, `%${validated.search}%`).or(like(profiles.name, `%${validated.search}%`))
    );
  }
  if (validated.role) {
    userQuery.where(eq(profiles.role, validated.role));
  }
  if (validated.subStatus) {
    userQuery.where(eq(subscriptions.status, validated.subStatus));
  }

  const [totalResult] = await db
    .select({ count: sql`count(*)` })
    .from(userQuery as any);

  const usersData = await userQuery.limit(validated.limit).offset(offset);

  return NextResponse.json({
    users: usersData,
    pagination: {
      page: validated.page,
      limit: validated.limit,
      total: Number(totalResult.count),
      totalPages: Math.ceil(Number(totalResult.count) / validated.limit),
    },
  });
}

