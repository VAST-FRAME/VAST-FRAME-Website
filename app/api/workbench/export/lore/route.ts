import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { workbenchFailure } from "@/lib/workbench/http";

export async function GET() {
  try {
    const access = await requireWorkbenchAccess(["admin"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    await ensureWorkbenchSchema();
    const database = getD1();
    const [spaces, entries, revisions, relationships] = await Promise.all([
      database.prepare("SELECT * FROM knowledge_spaces ORDER BY key").all(),
      database.prepare("SELECT * FROM knowledge_entries ORDER BY space_id, nav_order, title, id").all(),
      database.prepare("SELECT * FROM knowledge_entry_revisions ORDER BY entry_id, revision").all(),
      database.prepare("SELECT * FROM knowledge_links ORDER BY source_entry_id, target_entry_id, relationship").all(),
    ]);
    const exportedAt = new Date().toISOString();
    const filename = `vastframe-knowledge-${exportedAt.slice(0, 10)}.json`;
    const backup = {
      format: "vastframe-workbench-knowledge",
      schemaVersion: 2,
      exportedAt,
      exportedBy: access.identity.email,
      counts: {
        spaces: spaces.results.length,
        entries: entries.results.length,
        revisions: revisions.results.length,
        relationships: relationships.results.length,
      },
      spaces: spaces.results,
      entries: entries.results,
      revisions: revisions.results,
      relationships: relationships.results,
    };

    return new Response(`${JSON.stringify(backup, null, 2)}\n`, {
      headers: {
        "cache-control": "private, no-store, max-age=0",
        "content-disposition": `attachment; filename="${filename}"`,
        "content-type": "application/json; charset=utf-8",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return workbenchFailure(error);
  }
}
