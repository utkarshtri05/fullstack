import { requireUser } from "@/modules/auth/server";
import { listNotifications } from "@/modules/notifications/service";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    const { user } = await requireUser();
    const notifications = await listNotifications(user.id);
    return ok({ notifications });
  });
}
