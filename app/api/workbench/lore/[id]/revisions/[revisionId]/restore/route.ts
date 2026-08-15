import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";
import type { LoreEntry, LoreRevision } from "@/lib/workbench/lore";

type RouteContext = { params: Promise<{ id: string; revisionId: string }> };

type CurrentRow = {
  revision: number;
  record_status: LoreEntry["recordStatus"];
};

type SnapshotRow = {
  revision: number;
  title: string;
  summary: string;
  body: string;
  canon_status: LoreRevision["canonStatus"];
  entry_type: string;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id, revisionId } = await context.params;
    const payload = (await request.json()) as { expectedRevision?: number };

    if (!Number.isInteger(payload.expectedRevision)) {
      return Response.json({ error: "Expected revision is required." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const [current, snapshot] = await Promise.all([
      database
        .prepare("SELECT revision, record_status FROM lore_entries WHERE id = ?1")
        .bind(id)
        .first<CurrentRow>(),
      database
        .prepare(
          `SELECT revision, title, summary, body, canon_status, entry_type
           FROM lore_entry_revisions
           WHERE id = ?1 AND entry_id = ?2`,
        )
        .bind(revisionId, id)
        .first<SnapshotRow>(),
    ]);

    if (!current) return Response.json({ error: "Entry not found." }, { status: 404 });
    if (!snapshot) return Response.json({ error: "Revision not found." }, { status: 404 });
    if (current.record_status !== "active") {
      return Response.json({ error: "Restore the entry before restoring a historical revision." }, { status: 409 });
    }
    if (current.revision !== payload.expectedRevision) {
      return Response.json({ error: "This entry changed after you opened it. Refresh before restoring." }, { status: 409 });
    }
    if (snapshot.revision === current.revision) {
      return Response.json({ error: "That revision is already current." }, { status: 409 });
    }

    const revision = current.revision + 1;
    const author = access.identity.email;
    const results = await database.batch([
      database
        .prepare(
          `UPDATE lore_entries
           SET title = ?1, entry_type = ?2, summary = ?3, body = ?4, canon_status = ?5,
               revision = ?6, updated_by = ?7, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?8 AND revision = ?9 AND record_status = 'active'`,
        )
        .bind(
          snapshot.title,
          snapshot.entry_type,
          snapshot.summary,
          snapshot.body,
          snapshot.canon_status,
          revision,
          author,
          id,
          payload.expectedRevision,
        ),
      database
        .prepare(
          `INSERT INTO lore_entry_revisions (
            id, entry_id, revision, title, summary, body, canon_status,
            entry_type, record_status, change_kind, authored_by
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'active', 'revision_restore', ?9)`,
        )
        .bind(
          crypto.randomUUID(),
          id,
          revision,
          snapshot.title,
          snapshot.summary,
          snapshot.body,
          snapshot.canon_status,
          snapshot.entry_type,
          author,
        ),
      prepareAuditEvent(database, access, {
        action: "lore.revision_restore",
        entityType: "lore_entry",
        entityId: id,
        summary: `Restored “${snapshot.title}” from revision ${snapshot.revision} as revision ${revision}.`,
        metadata: {
          sourceRevision: snapshot.revision,
          previousRevision: payload.expectedRevision,
          revision,
        },
      }),
    ]);

    if (!results[0].meta.changes) {
      return Response.json({ error: "Revision conflict." }, { status: 409 });
    }

    return Response.json({
      entry: {
        title: snapshot.title,
        entryType: snapshot.entry_type,
        summary: snapshot.summary,
        body: snapshot.body,
        canonStatus: snapshot.canon_status,
        recordStatus: "active",
        revision,
        updatedBy: author,
      },
      restoredFromRevision: snapshot.revision,
    });
  } catch (error) {
    return workbenchFailure(error);
  }
}
