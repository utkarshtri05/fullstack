import { requireAdmin } from "@/modules/auth/server";
import { publishDraw } from "@/modules/draws/service";
import { assertUuid, ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ drawId: string }>;
};

export async function POST(_request: Request, context: Context) {
  return route(async () => {
    const { user } = await requireAdmin();
    const { drawId } = await context.params;
    const result = await publishDraw(user.id, assertUuid(drawId, "drawId"));
    return ok(result);
  });
}
