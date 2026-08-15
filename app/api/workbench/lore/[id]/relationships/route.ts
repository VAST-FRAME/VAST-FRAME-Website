import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";
import type { LoreRelationship } from "@/lib/workbench/lore";

type RouteContext = { params: Promise<{ id: string }> };

type RelationshipRow = {
  id: string;
  direction: "outgoing" | "incoming";
  relationship: string;
  entry_id: string;
  entry_title: string;
  entry_type: string;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireWorkbenchAccess();
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id } = await context.params;
    await ensureWorkbenchSchema();
    const result = await getD1()
      .prepare(
        `SELECT links.id, 'outgoing' AS direction, links.relationship,
                target.id AS entry_id, target.title AS entry_title, target.entry_type AS entry_type
         FROM lore_links links
         JOIN lore_entries target ON target.id = links.target_entry_id
         WHERE links.source_entry_id = ?1
         UNION ALL
         SELECT links.id, 'incoming' AS direction, links.relationship,
                source.id AS entry_id, source.title AS entry_title, source.entry_type AS entry_type
         FROM lore_links links
         JOIN lore_entries source ON source.id = links.source_entry_id
         WHERE links.target_entry_id = ?1
         ORDER BY entry_title ASC`,
      )
      .bind(id)
      .all<RelationshipRow>();

    return Response.json({
      relationships: result.results.map((row): LoreRelationship => ({
        id: row.id,
        direction: row.direction,
        relationship: row.relationship,
        entryId: row.entry_id,
        entryTitle: row.entry_title,
        entryType: row.entry_type,
      })),
    });
  } catch (error) {
    return workbenchFailure(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id } = await context.params;
    const payload = (await request.json()) as { targetEntryId?: string; relationship?: string };
    const targetEntryId = payload.targetEntryId?.trim() ?? "";
    const relationship = payload.relationship?.trim() ?? "";

    if (!targetEntryId || targetEntryId === id) {
      return Response.json({ error: "Choose another lore entry." }, { status: 400 });
    }
    if (!relationship || relationship.length > 80) {
      return Response.json({ error: "Describe the relationship in 1 to 80 characters." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const matches = await database
      .prepare(
        `SELECT COUNT(*) AS count FROM lore_entries
         WHERE id IN (?1, ?2) AND record_status = 'active'`,
      )
      .bind(id, targetEntryId)
      .first<{ count: number }>();
    if (Number(matches?.count) !== 2) {
      return Response.json({ error: "Both entries must be active." }, { status: 404 });
    }

    const linkId = crypto.randomUUID();
    try {
      await database.batch([
        database
          .prepare(
            `INSERT INTO lore_links (
              id, source_entry_id, target_entry_id, relationship, created_by
            ) VALUES (?1, ?2, ?3, ?4, ?5)`,
          )
          .bind(linkId, id, targetEntryId, relationship, access.identity.email),
        prepareAuditEvent(database, access, {
          action: "relationship.create",
          entityType: "lore_relationship",
          entityId: linkId,
          summary: `Created the “${relationship}” relationship.`,
          metadata: { sourceEntryId: id, targetEntryId, relationship },
        }),
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        return Response.json({ error: "That relationship already exists." }, { status: 409 });
      }
      throw error;
    }

    return Response.json({ id: linkId }, { status: 201 });
  } catch (error) {
    return workbenchFailure(error);
  }
}
