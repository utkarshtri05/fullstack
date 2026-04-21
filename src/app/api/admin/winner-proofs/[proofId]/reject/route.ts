import { requireAdmin } from "@/modules/auth/server";
import { proofReviewSchema } from "@/modules/winners/schemas";
import { rejectWinnerProof } from "@/modules/winners/service";
import { assertUuid, ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ proofId: string }>;
};

export async function POST(request: Request, context: Context) {
  return route(async () => {
    const { user } = await requireAdmin();
    const { proofId } = await context.params;
    const input = await parseJson(request, proofReviewSchema);
    const proof = await rejectWinnerProof(user.id, assertUuid(proofId, "proofId"), input);
    return ok({ proof });
  });
}
