import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditMetadata = Record<string, unknown>;

export async function writeAudit(action: string, actorId: string | null, metadata: AuditMetadata = {}) {
  await getDb().insert(auditLogs).values({
    action,
    actorId,
    metadata
  });
}
