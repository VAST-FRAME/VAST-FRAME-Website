import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";
import {
  loreCanonStatuses,
  loreEntryTypes,
  slugify,
  type LoreEntry,
} from "@/lib/workbench/lore";

type LoreRow = {
  id: string;
  slug: string;
  project_key: string;
  entry_type: string;
  title: string;
  summary: string;
  body: string;
  canon_status: LoreEntry["canonStatus"];
  record_status: LoreEntry["recordStatus"];
  revision: number;
  updated_by: string;
  updated_at: string;
};

export function mapLoreRow(row: LoreRow): LoreEntry {
  return {
    id: row.id,
    slug: row.slug,
    projectKey: row.project_key,
    entryType: row.entry_type,
    title: row.title,
    summary: row.summary,
    body: row.body,
    canonStatus: row.canon_status,
    recordStatus: row.record_status,
    revision: row.revision,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    await requireWorkbenchAccess();
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    await ensureWorkbenchSchema();
    const scope = new URL(request.url).searchParams.get("scope");
    const statusClause = scope === "all" ? "" : "WHERE record_status = 'active'";
    const result = await getD1()
      .prepare(
        `SELECT id, slug, project_key, entry_type, title, summary, body,
                canon_status, record_status, revision, updated_by, updated_at
         FROM lore_entries
         ${statusClause}
         ORDER BY updated_at DESC, title ASC
         LIMIT 500`,
      )
      .all<LoreRow>();
    return Response.json({ entries: result.results.map(mapLoreRow) });
  } catch (error) {
    return workbenchFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin", "editor", "contributor"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const payload = (await request.json()) as Partial<LoreEntry>;
    const title = payload.title?.trim() ?? "";
    const summary = payload.summary?.trim() ?? "";
    const body = payload.body?.trim() ?? "";
    const entryType = payload.entryType?.trim() ?? "";
    const canonStatus = payload.canonStatus ?? "idea";
    const projectKey = payload.projectKey?.trim() || "splinterheart";

    if (!title || title.length > 160) {
      return Response.json({ error: "Use a title between 1 and 160 characters." }, { status: 400 });
    }
    if (summary.length > 1200 || body.length > 100_000) {
      return Response.json({ error: "This entry exceeds the supported content size." }, { status: 400 });
    }
    if (!loreEntryTypes.includes(entryType as (typeof loreEntryTypes)[number])) {
      return Response.json({ error: "Choose a valid entry type." }, { status: 400 });
    }
    if (!loreCanonStatuses.includes(canonStatus)) {
      return Response.json({ error: "Choose a valid canon status." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const id = crypto.randomUUID();
    const slug = `${slugify(title)}-${id.slice(0, 6)}`;
    const author = access.identity.email;

    await database.batch([
      database
        .prepare(
          `INSERT INTO lore_entries (
            id, slug, project_key, entry_type, title, summary, body, canon_status,
            record_status, revision, created_by, updated_by
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'active', 1, ?9, ?9)`,
        )
        .bind(id, slug, projectKey, entryType, title, summary, body, canonStatus, author),
      database
        .prepare(
          `INSERT INTO lore_entry_revisions (
            id, entry_id, revision, title, summary, body, canon_status,
            entry_type, record_status, change_kind, authored_by
          ) VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, 'active', 'create', ?8)`,
        )
        .bind(crypto.randomUUID(), id, title, summary, body, canonStatus, entryType, author),
      prepareAuditEvent(database, access, {
        action: "lore.create",
        entityType: "lore_entry",
        entityId: id,
        summary: `Created lore entry “${title}”.`,
        metadata: { revision: 1, entryType, canonStatus, projectKey },
      }),
    ]);

    const row = await database
      .prepare(
        `SELECT id, slug, project_key, entry_type, title, summary, body,
                canon_status, record_status, revision, updated_by, updated_at
         FROM lore_entries WHERE id = ?1`,
      )
      .bind(id)
      .first<LoreRow>();

    return Response.json({ entry: row ? mapLoreRow(row) : null }, { status: 201 });
  } catch (error) {
    return workbenchFailure(error);
  }
}
