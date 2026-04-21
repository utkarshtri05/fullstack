import { getDb } from "@/db";
import { charities } from "@/db/schema";

export async function listCharities() {
  const db = getDb();
  return await db.select().from(charities).orderBy(charities.name);
}

