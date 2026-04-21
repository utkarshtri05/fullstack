import { getDb } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function listNotifications(userId: string) {
  return getDb()
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.id));
}

export async function markAllNotificationsRead(userId: string) {
  return getDb()
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId))
    .returning();
}

export async function createNotification(userId: string, type: string, message: string) {
  const [notification] = await getDb()
    .insert(notifications)
    .values({
      userId,
      type,
      message
    })
    .returning();

  return notification;
}
