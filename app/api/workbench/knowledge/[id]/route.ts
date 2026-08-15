import type { KnowledgeEntry } from "@/lib/knowledge/model";
import { mapKnowledgeRow, type KnowledgeRow } from "@/lib/knowledge/rows";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const { id } = await params;
    const payload = (await request.json()) as Partial<KnowledgeEntry> & { expectedRevision?: number };
    const title = payload.title?.trim() ?? ""; const summary = payload.summary?.trim() ?? ""; const body = payload.body?.trim() ?? "";
    if (!title || title.length > 180 || summary.length > 1200 || body.length > 150_000) return Response.json({ error: "Check the title and content limits." }, { status: 400 });
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema(); const database = getD1();
    const current = await database.prepare("SELECT * FROM knowledge_entries WHERE id = ?1").bind(id).first<Record<string, unknown> & { revision: number; publication_status: string; slug: string; parent_id: string | null; product_key: string | null; entry_type: string; version_label: string; nav_order: number }>();
    if (!current) return Response.json({ error: "Knowledge entry not found." }, { status: 404 });
    if (Number(payload.expectedRevision) !== current.revision) return Response.json({ error: "This entry changed after you opened it. Reload before saving." }, { status: 409 });
    if (current.publication_status === "archived") return Response.json({ error: "Restore this entry before editing it." }, { status: 409 });
    const revision = current.revision + 1; const author = access.identity.email;
    const entryType = payload.entryType ?? current.entry_type; const productKey = payload.productKey ?? current.product_key; const versionLabel = payload.versionLabel?.trim() || current.version_label; const navOrder = Math.max(0, Math.min(10000, Number(payload.navOrder ?? current.nav_order)));
    const nextStatus = current.publication_status === "published" ? "draft" : current.publication_status;
    await database.batch([
      database.prepare(`UPDATE knowledge_entries SET parent_id=?1, product_key=?2, entry_type=?3, title=?4, summary=?5, body=?6, version_label=?7, publication_status=?8, nav_order=?9, revision=?10, updated_by=?11, updated_at=CURRENT_TIMESTAMP WHERE id=?12 AND revision=?13`).bind(payload.parentSlug ?? current.parent_id, productKey, entryType, title, summary, body, versionLabel, nextStatus, navOrder, revision, author, id, current.revision),
      database.prepare(`INSERT INTO knowledge_entry_revisions (id, entry_id, revision, slug, parent_id, product_key, entry_type, title, summary, body, version_label, publication_status, nav_order, change_kind, authored_by) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,'edit',?14)`).bind(crypto.randomUUID(), id, revision, current.slug, payload.parentSlug ?? current.parent_id, productKey, entryType, title, summary, body, versionLabel, nextStatus, navOrder, author),
      prepareAuditEvent(database, access, { action: "knowledge.edit", entityType: "knowledge_entry", entityId: id, summary: `Saved revision ${revision} of “${title}”.`, metadata: { revision, publicationStatus: nextStatus } }),
    ]);
    const row = await database.prepare(`SELECT entries.id, spaces.key AS space_key, entries.slug, entries.parent_id, entries.product_key, entries.entry_type, entries.title, entries.summary, entries.body, entries.version_label, entries.publication_status, entries.nav_order, entries.revision, entries.published_revision, entries.updated_by, entries.updated_at FROM knowledge_entries entries JOIN knowledge_spaces spaces ON spaces.id=entries.space_id WHERE entries.id=?1`).bind(id).first<KnowledgeRow>();
    return Response.json({ entry: row ? mapKnowledgeRow(row) : null });
  } catch (error) { return workbenchFailure(error); }
}
