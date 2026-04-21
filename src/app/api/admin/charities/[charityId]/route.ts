import { requireAdmin } from "@/modules/auth/server";
import { charityUpsertSchema } from "@/modules/charity/schemas";
import { updateCharity } from "@/modules/charity/service";
import { assertUuid, ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ charityId: string }>;
};

export async function PATCH(request: Request, context: Context) {
  return route(async () => {
    const { user } = await requireAdmin();
    const { charityId } = await context.params;
    const input = await parseJson(request, charityUpsertSchema);
    const charity = await updateCharity(user.id, assertUuid(charityId, "charityId"), input);
    return ok({ charity });
  });
}
