import { requireUser } from "@/modules/auth/server";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    const context = await requireUser();
    return ok(context);
  });
}
