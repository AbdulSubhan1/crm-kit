import { db, schema } from "@/server/db";

/** Records a change. The record's timeline shows every row with the same entity and entityId. */
export async function logAudit(entry: {
  userId: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
}) {
  await db.insert(schema.auditLogs).values({
    userId: entry.userId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    details: entry.details ?? "",
  });
}
