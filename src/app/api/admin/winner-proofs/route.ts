import { requireAdmin } from "@/modules/auth/server";
import { ok, route } from "@/modules/shared/api";
import { listPendingProofs } from "@/modules/winners/service";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    await requireAdmin();
    const proofs = await listPendingProofs();
    return ok({ proofs });
  });
}
