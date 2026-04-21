import { requireUser } from "@/modules/auth/server";
import { createBillingPortalSession } from "@/modules/billing/service";
import { ok, route } from "@/modules/shared/api";
import { forbidden } from "@/modules/shared/errors";

export const runtime = "nodejs";

export async function POST() {
  return route(async () => {
    const { subscription } = await requireUser();

    if (!subscription) {
      throw forbidden();
    }

    const session = await createBillingPortalSession(subscription);
    return ok({
      url: session.url
    });
  });
}
