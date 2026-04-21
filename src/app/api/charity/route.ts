import { requireUser } from "@/modules/auth/server";
import { listCharities } from "@/modules/charity/service";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    await requireUser();
    const charities = await listCharities();
    return ok({ charities });
  });
}
