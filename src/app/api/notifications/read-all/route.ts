import { requireUser } from "@/modules/auth/server";
import { markAllNotificationsRead } from "@/modules/notifications/service";
import { ok, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function POST() {
  return route(async () => {
    const { user } = await requireUser();
    const notifications = await markAllNotificationsRead(user.id);
    return ok({ notifications });
  });
}
