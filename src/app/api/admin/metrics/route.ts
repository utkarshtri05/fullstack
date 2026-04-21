import { requireAdmin } from "@/modules/auth/server";
import { getAdminMetrics } from "@/modules/analytics/service";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    await requireAdmin();
    const metrics = await getAdminMetrics();
    return ok({ metrics });
  });
}
