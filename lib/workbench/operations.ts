import type { WorkbenchAuditEvent } from "./audit";
import { ensureWorkbenchSchema, getD1 } from "./database";

type AuditRow = {
  id: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata_json: string;
  created_at: string;
};

function parseMetadata(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export async function getWorkbenchAuditEvents(limit = 100): Promise<WorkbenchAuditEvent[]> {
  await ensureWorkbenchSchema();
  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 250));
  const result = await getD1()
    .prepare(
      `SELECT id, actor_email, action, entity_type, entity_id, summary,
              metadata_json, created_at
       FROM workbench_audit_events
       ORDER BY created_at DESC, rowid DESC
       LIMIT ?1`,
    )
    .bind(safeLimit)
    .all<AuditRow>();

  return result.results.map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    metadata: parseMetadata(row.metadata_json),
    createdAt: row.created_at,
  }));
}
