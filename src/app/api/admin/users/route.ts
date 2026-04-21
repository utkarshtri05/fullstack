import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/modules/auth/server";
import { listAdminUsers } from "@/modules/admin/service";

const searchSchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["user", "admin"]).optional(),
  subStatus: z.enum(["active", "past_due", "canceled", "incomplete"]).optional()
});

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const query = searchSchema.parse({
    search: searchParams.get("search") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    subStatus: searchParams.get("subStatus") ?? undefined
  });

  const users = await listAdminUsers(query);
  return NextResponse.json({ users, total: users.length });
}
