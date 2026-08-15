import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const { id } = await params;
    const { publicationStatus } = await request.json() as { publicationStatus?: "draft" | "review" | "archived" };
    if (!publicationStatus || !["draft", "review", "archived"].includes(publicationStatus)) return Response.json({ error: "Choose a valid editorial state." }, { status: 400 });
    if (access.role === "contributor" && publicationStatus !== "review") return Response.json({ error: "Contributors can submit review but cannot archive or reopen entries." }, { status: 403 });
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema(); const database = getD1();
    const entry = await database.prepare("SELECT * FROM knowledge_entries WHERE id=?1").bind(id).first<{ revision: number; slug: string; parent_id: string | null; product_key: string | null; entry_type: string; title: string; summary: string; body: string; version_label: string; nav_order: number }>();
    if (!entry) return Response.json({ error: "Knowledge entry not found." }, { status: 404 });
    const revision = entry.revision + 1; const changeKind = publicationStatus === "review" ? "submit_review" : publicationStatus === "archived" ? "archive" : "edit";
    await database.batch([
      database.prepare("UPDATE knowledge_entries SET publication_status=?1, published_revision=CASE WHEN ?1='archived' THEN NULL ELSE published_revision END, revision=?2, updated_by=?3, updated_at=CURRENT_TIMESTAMP WHERE id=?4 AND revision=?5").bind(publicationStatus, revision, access.identity.email, id, entry.revision),
      database.prepare(`INSERT INTO knowledge_entry_revisions (id,entry_id,revision,slug,parent_id,product_key,entry_type,title,summary,body,version_label,publication_status,nav_order,change_kind,authored_by) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)`).bind(crypto.randomUUID(), id, revision, entry.slug, entry.parent_id, entry.product_key, entry.entry_type, entry.title, entry.summary, entry.body, entry.version_label, publicationStatus, entry.nav_order, changeKind, access.identity.email),
      prepareAuditEvent(database, access, { action: `knowledge.${changeKind}`, entityType: "knowledge_entry", entityId: id, summary: `Changed “${entry.title}” to ${publicationStatus}.`, metadata: { revision, publicationStatus } }),
    ]);
    return Response.json({ publicationStatus, revision });
  } catch (error) { return workbenchFailure(error); }
}
