import type { KnowledgeRelationship } from "@/lib/knowledge/model";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

type Row = { id: string; direction: "outgoing" | "incoming"; relationship: string; entry_id: string; entry_title: string; entry_type: string };
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireWorkbenchAccess(); const { id } = await params; const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema();
    const result = await getD1().prepare(`SELECT links.id, 'outgoing' AS direction, links.relationship, target.id AS entry_id, target.title AS entry_title, target.entry_type FROM knowledge_links links JOIN knowledge_entries target ON target.id=links.target_entry_id WHERE links.source_entry_id=?1 UNION ALL SELECT links.id, 'incoming' AS direction, links.relationship, source.id AS entry_id, source.title AS entry_title, source.entry_type FROM knowledge_links links JOIN knowledge_entries source ON source.id=links.source_entry_id WHERE links.target_entry_id=?1 ORDER BY entry_title`).bind(id).all<Row>();
    return Response.json({ relationships: result.results.map((row): KnowledgeRelationship => ({ id: row.id, direction: row.direction, relationship: row.relationship, entryId: row.entry_id, entryTitle: row.entry_title, entryType: row.entry_type })) });
  } catch (error) { return workbenchFailure(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { requireWorkbenchMutation(request); const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]); const { id } = await params; const payload = await request.json() as { targetEntryId?: string; relationship?: string }; const target = payload.targetEntryId?.trim() ?? ""; const relationship = payload.relationship?.trim() ?? "";
    if (!target || target === id) return Response.json({ error: "Choose another knowledge entry." }, { status: 400 }); if (!relationship || relationship.length > 80) return Response.json({ error: "Use a relationship between 1 and 80 characters." }, { status: 400 });
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema(); const database = getD1(); const pair = await database.prepare("SELECT COUNT(*) AS count FROM knowledge_entries WHERE id IN (?1,?2)").bind(id,target).first<{count:number}>(); if (Number(pair?.count) !== 2) return Response.json({ error: "Both entries must exist." }, { status: 404 });
    const linkId = crypto.randomUUID(); await database.batch([database.prepare("INSERT INTO knowledge_links (id,source_entry_id,target_entry_id,relationship,created_by) VALUES (?1,?2,?3,?4,?5)").bind(linkId,id,target,relationship,access.identity.email), prepareAuditEvent(database,access,{action:"knowledge.relationship.create",entityType:"knowledge_relationship",entityId:linkId,summary:`Connected two knowledge entries as “${relationship}”.`,metadata:{sourceEntryId:id,targetEntryId:target,relationship}})]); return Response.json({ id: linkId }, { status: 201 });
  } catch (error) { return workbenchFailure(error); }
}
