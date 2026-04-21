import { requireAdmin } from "@/modules/auth/server";
import { drawSimulationSchema } from "@/modules/draws/schemas";
import { simulateDraw } from "@/modules/draws/service";
import { created, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return route(async () => {
    const { user } = await requireAdmin();
    const input = await parseJson(request, drawSimulationSchema);
    const result = await simulateDraw(user.id, input);
    return created(result);
  });
}
