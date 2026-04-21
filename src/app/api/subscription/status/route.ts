import { hasActiveSubscription, requireUser } from "@/modules/auth/server";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    const { subscription } = await requireUser();

    return ok({
      subscription,
      active: hasActiveSubscription(subscription)
    });
  });
}
