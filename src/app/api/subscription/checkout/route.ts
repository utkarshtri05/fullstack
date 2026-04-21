import { requireUser } from "@/modules/auth/server";
import { createCheckoutSession } from "@/modules/billing/service";
import { checkoutSchema } from "@/modules/billing/schemas";
import { ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return route(async () => {
    const { user } = await requireUser();
    const input = await parseJson(request, checkoutSchema);
    const session = await createCheckoutSession(user.id, user.email, input);

    return ok({
      id: session.id,
      url: session.url
    });
  });
}
