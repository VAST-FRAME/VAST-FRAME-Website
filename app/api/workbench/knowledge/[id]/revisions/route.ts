import type { KnowledgeSpaceKey } from "@/lib/knowledge/model";
import { mapKnowledgeRevisionRow, type KnowledgeRevisionRow } from "@/lib/knowledge/rows";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { workbenchFailure } from "@/lib/workbench/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireWorkbenchAccess(); const { id } = await params;
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema(); const database = getD1();
    const entry = await database.prepare(`SELECT spaces.key AS space_key FROM knowledge_entries entries JOIN knowledge_spaces spaces ON spaces.id=entries.space_id WHERE entries.id=?1`).bind(id).first<{ space_key: KnowledgeSpaceKey }>();
    if (!entry) return Response.json({ error: "Knowledge entry not found." }, { status: 404 });
    const result = await database.prepare(`SELECT id AS revision_id, entry_id AS id, revision, slug, parent_id, product_key, entry_type, title, summary, body, version_label, publication_status, nav_order, change_kind, authored_by, created_at FROM knowledge_entry_revisions WHERE entry_id=?1 ORDER BY revision DESC LIMIT 100`).bind(id).all<KnowledgeRevisionRow>();
    return Response.json({ revisions: result.results.map((row) => mapKnowledgeRevisionRow(row, entry.space_key)) });
  } catch (error) { return workbenchFailure(error); }
}
