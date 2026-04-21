import { requireActiveSubscription, requireUser } from "@/modules/auth/server";
import { createScore, listScores } from "@/modules/scores/service";
import { scoreCreateSchema } from "@/modules/scores/schemas";
import { created, ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    const { user } = await requireUser();
    const scores = await listScores(user.id);
    return ok({ scores });
  });
}

export async function POST(request: Request) {
  return route(async () => {
    const { user } = await requireActiveSubscription();
    const input = await parseJson(request, scoreCreateSchema);
    const scores = await createScore(user.id, input);
    return created({ scores });
  });
}
