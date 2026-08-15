import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

type RouteContext = { params: Promise<{ id: string; linkId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id, linkId } = await context.params;
    await ensureWorkbenchSchema();
    const database = getD1();
    const relationship = await database
      .prepare(
        `SELECT source_entry_id, target_entry_id, relationship
         FROM lore_links
         WHERE id = ?1 AND (source_entry_id = ?2 OR target_entry_id = ?2)`,
      )
      .bind(linkId, id)
      .first<{ source_entry_id: string; target_entry_id: string; relationship: string }>();
    if (!relationship) {
      return Response.json({ error: "Relationship not found." }, { status: 404 });
    }

    const results = await database.batch([
      database
      .prepare(
        `DELETE FROM lore_links
         WHERE id = ?1 AND (source_entry_id = ?2 OR target_entry_id = ?2)`,
      )
      .bind(linkId, id),
      prepareAuditEvent(database, access, {
        action: "relationship.delete",
        entityType: "lore_relationship",
        entityId: linkId,
        summary: `Removed the “${relationship.relationship}” relationship.`,
        metadata: {
          sourceEntryId: relationship.source_entry_id,
          targetEntryId: relationship.target_entry_id,
          relationship: relationship.relationship,
        },
      }),
    ]);
    if (!results[0].meta.changes) {
      return Response.json({ error: "Relationship not found." }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return workbenchFailure(error);
  }
}
