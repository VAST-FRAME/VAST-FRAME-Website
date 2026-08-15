import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor"]);
    const { id } = await params;
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema(); const database = getD1();
    const entry = await database.prepare(`SELECT entries.*, spaces.visibility AS space_visibility, spaces.key AS space_key FROM knowledge_entries entries JOIN knowledge_spaces spaces ON spaces.id=entries.space_id WHERE entries.id=?1`).bind(id).first<{ revision: number; title: string; publication_status: string; space_visibility: string; space_key: string; slug: string; parent_id: string | null; product_key: string | null; entry_type: string; summary: string; body: string; version_label: string; nav_order: number }>();
    if (!entry) return Response.json({ error: "Knowledge entry not found." }, { status: 404 });
    if (entry.space_visibility !== "public") return Response.json({ error: "Private knowledge spaces cannot be published publicly." }, { status: 400 });
    if (entry.publication_status === "archived") return Response.json({ error: "Archived entries cannot be published." }, { status: 409 });
    const revision = entry.revision + 1; const author = access.identity.email;
    await database.batch([
      database.prepare("UPDATE knowledge_entries SET publication_status='published', revision=?1, published_revision=?1, updated_by=?2, updated_at=CURRENT_TIMESTAMP WHERE id=?3 AND revision=?4").bind(revision, author, id, entry.revision),
      database.prepare(`INSERT INTO knowledge_entry_revisions (id,entry_id,revision,slug,parent_id,product_key,entry_type,title,summary,body,version_label,publication_status,nav_order,change_kind,authored_by) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,'published',?12,'publish',?13)`).bind(crypto.randomUUID(), id, revision, entry.slug, entry.parent_id, entry.product_key, entry.entry_type, entry.title, entry.summary, entry.body, entry.version_label, entry.nav_order, author),
      prepareAuditEvent(database, access, { action: "knowledge.publish", entityType: "knowledge_entry", entityId: id, summary: `Published revision ${revision} of “${entry.title}”.`, metadata: { revision, spaceKey: entry.space_key, slug: entry.slug } }),
    ]);
    return Response.json({ published: true, revision });
  } catch (error) { return workbenchFailure(error); }
}
