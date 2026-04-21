import { requireUser } from "@/modules/auth/server";
import { assertUuid, ok, route } from "@/modules/shared/api";
import { deleteScore } from "@/modules/scores/service";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ scoreId: string }>;
};

export async function DELETE(_request: Request, context: Context) {
  return route(async () => {
    const { user } = await requireUser();
    const { scoreId } = await context.params;
    const score = await deleteScore(user.id, assertUuid(scoreId, "scoreId"));

    return ok({ score });
  });
}
