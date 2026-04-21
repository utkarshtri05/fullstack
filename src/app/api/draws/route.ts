import { requireUser } from "@/modules/auth/server";
import { listDraws } from "@/modules/draws/service";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    await requireUser();
    const draws = await listDraws();
    return ok({ draws });
  });
}
