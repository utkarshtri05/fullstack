import { requireAdmin } from "@/modules/auth/server";
import { assertUuid, ok, route } from "@/modules/shared/api";
import { markPayoutPaid } from "@/modules/winners/service";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ payoutId: string }>;
};

export async function POST(_request: Request, context: Context) {
  return route(async () => {
    const { user } = await requireAdmin();
    const { payoutId } = await context.params;
    const payout = await markPayoutPaid(user.id, assertUuid(payoutId, "payoutId"));
    return ok({ payout });
  });
}
