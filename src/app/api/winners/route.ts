import { requireUser } from "@/modules/auth/server";
import { winnerProofCreateSchema } from "@/modules/winners/schemas";
import { listWinnerCenter, submitWinnerProof } from "@/modules/winners/service";
import { created, ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    const { user } = await requireUser();
    const data = await listWinnerCenter(user.id);
    return ok(data);
  });
}

export async function POST(request: Request) {
  return route(async () => {
    const { user } = await requireUser();
    const input = await parseJson(request, winnerProofCreateSchema);
    const proof = await submitWinnerProof(user.id, input);
    return created({ proof });
  });
}
