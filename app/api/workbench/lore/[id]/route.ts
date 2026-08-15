import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";
import { loreCanonStatuses, loreEntryTypes, type LoreEntry } from "@/lib/workbench/lore";

type RouteContext = { params: Promise<{ id: string }> };

type CurrentLoreRow = {
  revision: number;
  title: string;
  summary: string;
  body: string;
  canon_status: LoreEntry["canonStatus"];
  entry_type: string;
  record_status: LoreEntry["recordStatus"];
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id } = await context.params;
    const payload = (await request.json()) as Partial<LoreEntry> & { expectedRevision?: number };
    const title = payload.title?.trim() ?? "";
    const summary = payload.summary?.trim() ?? "";
    const body = payload.body?.trim() ?? "";
    const entryType = payload.entryType?.trim() ?? "";
    const canonStatus = payload.canonStatus ?? "draft";
    const expectedRevision = payload.expectedRevision;

    if (!title || title.length > 160) {
      return Response.json({ error: "Use a title between 1 and 160 characters." }, { status: 400 });
    }
    if (summary.length > 1200 || body.length > 100_000) {
      return Response.json({ error: "This entry exceeds the supported content size." }, { status: 400 });
    }
    if (!loreEntryTypes.includes(entryType as (typeof loreEntryTypes)[number])) {
      return Response.json({ error: "Choose a valid entry type." }, { status: 400 });
    }
    if (!loreCanonStatuses.includes(canonStatus)) {
      return Response.json({ error: "Choose a valid canon status." }, { status: 400 });
    }
    if (!Number.isInteger(expectedRevision)) {
      return Response.json({ error: "Expected revision is required." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const current = await database
      .prepare(
        `SELECT revision, title, summary, body, canon_status, entry_type, record_status
         FROM lore_entries WHERE id = ?1`,
      )
      .bind(id)
      .first<CurrentLoreRow>();

    if (!current) return Response.json({ error: "Entry not found." }, { status: 404 });
    if (current.record_status !== "active") {
      return Response.json({ error: "Restore this entry before editing it." }, { status: 409 });
    }
    if (current.revision !== expectedRevision) {
      return Response.json(
        { error: "This entry changed after you opened it. Refresh before saving." },
        { status: 409 },
      );
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
        .bind(title, entryType, summary, body, canonStatus, revision, author, id, expectedRevision),
      database
        .prepare(
          `INSERT INTO lore_entry_revisions (
            id, entry_id, revision, title, summary, body, canon_status,
            entry_type, record_status, change_kind, authored_by
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'active', 'edit', ?9)`,
        )
        .bind(crypto.randomUUID(), id, revision, title, summary, body, canonStatus, entryType, author),
      prepareAuditEvent(database, access, {
        action: "lore.edit",
        entityType: "lore_entry",
        entityId: id,
        summary: `Saved revision ${revision} of “${title}”.`,
        metadata: { revision, previousRevision: expectedRevision, entryType, canonStatus },
      }),
    ]);

    if (!results[0].meta.changes) {
      return Response.json({ error: "Revision conflict." }, { status: 409 });
    }

    return Response.json({ revision, updatedAt: new Date().toISOString(), updatedBy: author });
  } catch (error) {
    return workbenchFailure(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id } = await context.params;
    const payload = (await request.json()) as {
      expectedRevision?: number;
      recordStatus?: LoreEntry["recordStatus"];
    };
    const expectedRevision = payload.expectedRevision;
    const recordStatus = payload.recordStatus;

    if (!Number.isInteger(expectedRevision) || !["active", "archived"].includes(recordStatus ?? "")) {
      return Response.json({ error: "A valid status and expected revision are required." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const current = await database
      .prepare(
        `SELECT revision, title, summary, body, canon_status, entry_type, record_status
         FROM lore_entries WHERE id = ?1`,
      )
      .bind(id)
      .first<CurrentLoreRow>();
    if (!current) return Response.json({ error: "Entry not found." }, { status: 404 });
    if (current.revision !== expectedRevision) {
      return Response.json({ error: "Revision conflict. Refresh before changing status." }, { status: 409 });
    }
    if (current.record_status === recordStatus) {
      return Response.json({ revision: current.revision, recordStatus });
    }

    const revision = current.revision + 1;
    const author = access.identity.email;
    const changeKind = recordStatus === "archived" ? "archive" : "restore";
    const results = await database.batch([
      database
        .prepare(
          `UPDATE lore_entries
           SET record_status = ?1, revision = ?2, updated_by = ?3, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?4 AND revision = ?5`,
        )
        .bind(recordStatus, revision, author, id, expectedRevision),
      database
        .prepare(
          `INSERT INTO lore_entry_revisions (
            id, entry_id, revision, title, summary, body, canon_status,
            entry_type, record_status, change_kind, authored_by
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
        )
        .bind(
          crypto.randomUUID(), id, revision, current.title, current.summary, current.body,
          current.canon_status, current.entry_type, recordStatus, changeKind, author,
        ),
      prepareAuditEvent(database, access, {
        action: recordStatus === "archived" ? "lore.archive" : "lore.restore",
        entityType: "lore_entry",
        entityId: id,
        summary: `${recordStatus === "archived" ? "Archived" : "Restored"} “${current.title}”.`,
        metadata: { revision, previousRevision: expectedRevision, recordStatus },
      }),
    ]);
    if (!results[0].meta.changes) {
      return Response.json({ error: "Revision conflict." }, { status: 409 });
    }

    return Response.json({ revision, recordStatus, updatedBy: author });
  } catch (error) {
    return workbenchFailure(error);
  }
}
