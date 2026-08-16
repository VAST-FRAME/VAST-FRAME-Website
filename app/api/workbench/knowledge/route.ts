import { knowledgeSpaceKeys, knowledgeSlug, type KnowledgeEntry, type KnowledgeSpaceKey } from "@/lib/knowledge/model";
import { mapKnowledgeRow, type KnowledgeRow } from "@/lib/knowledge/rows";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";

const entryTypes = ["overview", "concept", "guide", "reference", "lore", "category", "character", "enemy", "weapon", "location", "faction", "story", "system", "production"] as const;

export async function GET(request: Request) {
  try {
    await requireWorkbenchAccess();
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    await ensureWorkbenchSchema();
    const spaceKey = new URL(request.url).searchParams.get("space") ?? "splinterheart-lore";
    if (!knowledgeSpaceKeys.includes(spaceKey as KnowledgeSpaceKey)) return Response.json({ error: "Unknown knowledge space." }, { status: 400 });
    const result = await getD1().prepare(
      `SELECT entries.id, spaces.key AS space_key, entries.slug, entries.parent_id, entries.product_key,
        entries.entry_type, entries.title, entries.summary, entries.body, entries.version_label,
        entries.publication_status, entries.nav_order, entries.revision, entries.published_revision,
        entries.updated_by, entries.updated_at
       FROM knowledge_entries entries JOIN knowledge_spaces spaces ON spaces.id = entries.space_id
       WHERE spaces.key = ?1 ORDER BY entries.nav_order, entries.title LIMIT 1000`,
    ).bind(spaceKey).all<KnowledgeRow>();
    return Response.json({ entries: result.results.map(mapKnowledgeRow) });
  } catch (error) { return workbenchFailure(error); }
}

export async function POST(request: Request) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const payload = (await request.json()) as Partial<KnowledgeEntry>;
    const spaceKey = payload.spaceKey ?? "splinterheart-lore";
    const title = payload.title?.trim() ?? "";
    const summary = payload.summary?.trim() ?? "";
    const body = payload.body?.trim() ?? "";
    const entryType = payload.entryType ?? (spaceKey === "sdk-docs" ? "guide" : "category");
    const productKey = spaceKey === "splinterheart-lore"
      ? "splinterheart"
      : spaceKey === "snowfall-lore"
        ? "snowfall"
        : payload.productKey?.trim() || null;
    const versionLabel = payload.versionLabel?.trim() || (spaceKey === "sdk-docs" ? "0.x / development" : "internal");
    const navOrder = Math.max(0, Math.min(10000, Number(payload.navOrder ?? 100)));
    if (!knowledgeSpaceKeys.includes(spaceKey)) return Response.json({ error: "Choose a valid knowledge space." }, { status: 400 });
    if (!title || title.length > 180) return Response.json({ error: "Use a title between 1 and 180 characters." }, { status: 400 });
    if (summary.length > 1200 || body.length > 150_000) return Response.json({ error: "This entry exceeds the supported content size." }, { status: 400 });
    if (!entryTypes.includes(entryType as (typeof entryTypes)[number])) return Response.json({ error: "Choose a valid entry type." }, { status: 400 });
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    await ensureWorkbenchSchema();
    const database = getD1();
    const space = await database.prepare("SELECT id FROM knowledge_spaces WHERE key = ?1").bind(spaceKey).first<{ id: string }>();
    if (!space) return Response.json({ error: "Knowledge space is unavailable." }, { status: 400 });
    const id = crypto.randomUUID();
    const leaf = knowledgeSlug(payload.slug?.split("/").at(-1) || title);
    const slug = spaceKey === "sdk-docs" && productKey ? `${knowledgeSlug(productKey)}/${leaf}` : `${leaf}-${id.slice(0, 6)}`;
    const author = access.identity.email;
    await database.batch([
      database.prepare(`INSERT INTO knowledge_entries (id, space_id, slug, parent_id, product_key, entry_type, title, summary, body, version_label, publication_status, nav_order, revision, published_revision, created_by, updated_by) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'draft', ?11, 1, NULL, ?12, ?12)`).bind(id, space.id, slug, payload.parentSlug ?? null, productKey, entryType, title, summary, body, versionLabel, navOrder, author),
      database.prepare(`INSERT INTO knowledge_entry_revisions (id, entry_id, revision, slug, parent_id, product_key, entry_type, title, summary, body, version_label, publication_status, nav_order, change_kind, authored_by) VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'draft', ?11, 'create', ?12)`).bind(crypto.randomUUID(), id, slug, payload.parentSlug ?? null, productKey, entryType, title, summary, body, versionLabel, navOrder, author),
      prepareAuditEvent(database, access, { action: "knowledge.create", entityType: "knowledge_entry", entityId: id, summary: `Created ${spaceKey} entry “${title}”.`, metadata: { spaceKey, entryType, productKey } }),
    ]);
    const row = await database.prepare(`SELECT entries.id, spaces.key AS space_key, entries.slug, entries.parent_id, entries.product_key, entries.entry_type, entries.title, entries.summary, entries.body, entries.version_label, entries.publication_status, entries.nav_order, entries.revision, entries.published_revision, entries.updated_by, entries.updated_at FROM knowledge_entries entries JOIN knowledge_spaces spaces ON spaces.id = entries.space_id WHERE entries.id = ?1`).bind(id).first<KnowledgeRow>();
    return Response.json({ entry: row ? mapKnowledgeRow(row) : null }, { status: 201 });
  } catch (error) { return workbenchFailure(error); }
}
