import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; linkId: string }> }) {
  try { requireWorkbenchMutation(request); const access = await requireWorkbenchAccess(["admin","editor","contributor"]); const { id, linkId } = await params; const { ensureWorkbenchSchema,getD1 } = await import("@/lib/workbench/database"); await ensureWorkbenchSchema(); const database=getD1(); const link=await database.prepare("SELECT source_entry_id,target_entry_id,relationship FROM knowledge_links WHERE id=?1 AND (source_entry_id=?2 OR target_entry_id=?2)").bind(linkId,id).first<{source_entry_id:string;target_entry_id:string;relationship:string}>(); if(!link)return Response.json({error:"Relationship not found."},{status:404}); await database.batch([database.prepare("DELETE FROM knowledge_links WHERE id=?1").bind(linkId),prepareAuditEvent(database,access,{action:"knowledge.relationship.delete",entityType:"knowledge_relationship",entityId:linkId,summary:`Removed knowledge relationship “${link.relationship}”.`,metadata:link})]); return Response.json({deleted:true}); } catch(error){return workbenchFailure(error);}
}
