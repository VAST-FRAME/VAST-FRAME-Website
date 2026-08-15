import type { WorkbenchAccess } from "./auth";

export type WorkbenchAuditEvent = {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export function prepareAuditEvent(
  database: D1Database,
  access: WorkbenchAccess,
  event: {
    action: string;
    entityType: string;
    entityId: string;
    summary: string;
    metadata?: Record<string, unknown>;
  },
): D1PreparedStatement {
  return database
    .prepare(
      `INSERT INTO workbench_audit_events (
        id, actor_id, actor_email, action, entity_type, entity_id, summary, metadata_json, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
    )
    .bind(
      crypto.randomUUID(),
      access.identity.id,
      access.identity.email,
      event.action,
      event.entityType,
      event.entityId,
      event.summary,
      JSON.stringify(event.metadata ?? {}),
      new Date().toISOString(),
    );
}
