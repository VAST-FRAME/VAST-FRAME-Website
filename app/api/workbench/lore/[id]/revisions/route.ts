import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { workbenchFailure } from "@/lib/workbench/http";
import type { LoreRevision } from "@/lib/workbench/lore";

type RouteContext = { params: Promise<{ id: string }> };

type RevisionRow = {
  id: string;
  revision: number;
  title: string;
  summary: string;
  body: string;
  entry_type: string;
  canon_status: LoreRevision["canonStatus"];
  record_status: LoreRevision["recordStatus"];
  change_kind: LoreRevision["changeKind"];
  authored_by: string;
  created_at: string;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireWorkbenchAccess();
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id } = await context.params;
    await ensureWorkbenchSchema();
    const result = await getD1()
      .prepare(
        `SELECT id, revision, title, summary, body, entry_type, canon_status,
                record_status, change_kind, authored_by, created_at
         FROM lore_entry_revisions
         WHERE entry_id = ?1
         ORDER BY revision DESC
         LIMIT 100`,
      )
      .bind(id)
      .all<RevisionRow>();

    return Response.json({
      revisions: result.results.map((row): LoreRevision => ({
        id: row.id,
        revision: row.revision,
        title: row.title,
        summary: row.summary,
        body: row.body,
        entryType: row.entry_type,
        canonStatus: row.canon_status,
        recordStatus: row.record_status,
        changeKind: row.change_kind,
        authoredBy: row.authored_by,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return workbenchFailure(error);
  }
}
