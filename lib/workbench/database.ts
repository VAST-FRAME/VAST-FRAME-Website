import { env } from "cloudflare:workers";
import { gameWikiDocuments } from "@/lib/knowledge/game-wiki-documents";
import { knowledgeSpaces } from "@/lib/knowledge/model";
import { sdkDocuments } from "@/lib/knowledge/sdk-documents";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS studio_members (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','editor','contributor','viewer')),
    status TEXT NOT NULL CHECK (status IN ('invited','active','disabled')),
    invited_by TEXT,
    last_seen_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_members_email ON studio_members(email)`,
  `CREATE TABLE IF NOT EXISTS lore_entries (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    project_key TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    canon_status TEXT NOT NULL CHECK (canon_status IN ('idea','draft','canon','deprecated','contradictory')),
    record_status TEXT NOT NULL CHECK (record_status IN ('active','archived')),
    revision INTEGER NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_lore_entries_slug ON lore_entries(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_lore_entries_project_status ON lore_entries(project_key, record_status)`,
  `CREATE INDEX IF NOT EXISTS idx_lore_entries_updated_at ON lore_entries(updated_at)`,
  `CREATE TABLE IF NOT EXISTS lore_entry_revisions (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    canon_status TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    record_status TEXT NOT NULL,
    change_kind TEXT NOT NULL CHECK (change_kind IN ('create','edit','archive','restore','revision_restore')),
    authored_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entry_id, revision)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_lore_revisions_created_at ON lore_entry_revisions(created_at)`,
  `CREATE TABLE IF NOT EXISTS lore_links (
    id TEXT PRIMARY KEY,
    source_entry_id TEXT NOT NULL,
    target_entry_id TEXT NOT NULL,
    relationship TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_entry_id, target_entry_id, relationship)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_lore_links_target ON lore_links(target_entry_id)`,
  `CREATE TABLE IF NOT EXISTS knowledge_spaces (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    visibility TEXT NOT NULL CHECK (visibility IN ('private','public')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_spaces_key ON knowledge_spaces(key)`,
  `CREATE TABLE IF NOT EXISTS knowledge_entries (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    parent_id TEXT,
    product_key TEXT,
    entry_type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    version_label TEXT NOT NULL DEFAULT '0.x / development',
    publication_status TEXT NOT NULL CHECK (publication_status IN ('draft','review','published','archived')),
    nav_order INTEGER NOT NULL DEFAULT 100,
    revision INTEGER NOT NULL DEFAULT 1,
    published_revision INTEGER,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(space_id, slug)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_knowledge_entries_space_status_order ON knowledge_entries(space_id, publication_status, nav_order)`,
  `CREATE INDEX IF NOT EXISTS idx_knowledge_entries_product_status ON knowledge_entries(product_key, publication_status)`,
  `CREATE INDEX IF NOT EXISTS idx_knowledge_entries_parent ON knowledge_entries(parent_id)`,
  `CREATE TABLE IF NOT EXISTS knowledge_entry_revisions (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    slug TEXT NOT NULL,
    parent_id TEXT,
    product_key TEXT,
    entry_type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    version_label TEXT NOT NULL,
    publication_status TEXT NOT NULL,
    nav_order INTEGER NOT NULL,
    change_kind TEXT NOT NULL CHECK (change_kind IN ('create','edit','submit_review','publish','archive','revision_restore')),
    authored_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entry_id, revision)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_knowledge_revisions_created_at ON knowledge_entry_revisions(created_at)`,
  `CREATE TABLE IF NOT EXISTS knowledge_links (
    id TEXT PRIMARY KEY,
    source_entry_id TEXT NOT NULL,
    target_entry_id TEXT NOT NULL,
    relationship TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_entry_id, target_entry_id, relationship)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_knowledge_links_target ON knowledge_links(target_entry_id)`,
  `CREATE TABLE IF NOT EXISTS workbench_audit_events (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON workbench_audit_events(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_events_actor_created ON workbench_audit_events(actor_email, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_events_entity_created ON workbench_audit_events(entity_type, entity_id, created_at)`,
] as const;

let schemaReady: Promise<void> | null = null;

async function seedKnowledge(database: D1Database): Promise<void> {
  const seedStatements: D1PreparedStatement[] = knowledgeSpaces.map((space) =>
    database.prepare(
      `INSERT INTO knowledge_spaces (id, key, title, description, visibility)
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET key=excluded.key, title=excluded.title,
         description=excluded.description, visibility=excluded.visibility, updated_at=CURRENT_TIMESTAMP`,
    ).bind(space.id, space.key, space.title, space.description, space.visibility),
  );

  const documentByPath = new Map(sdkDocuments.map((document) => [`${document.productKey}/${document.slug}`, document]));
  for (const document of sdkDocuments) {
    const fullSlug = `${document.productKey}/${document.slug}`;
    const parent = document.parentSlug ? documentByPath.get(`${document.productKey}/${document.parentSlug}`) : null;
    seedStatements.push(
      database.prepare(
        `INSERT OR IGNORE INTO knowledge_entries (
          id, space_id, slug, parent_id, product_key, entry_type, title, summary, body,
          version_label, publication_status, nav_order, revision, published_revision, created_by, updated_by
        ) VALUES (?1, 'space-sdk-docs', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'published', ?10, 1, 1, 'system-seed', 'system-seed')`,
      ).bind(document.id, fullSlug, parent?.id ?? null, document.productKey, document.entryType, document.title, document.summary, document.body, document.versionLabel, document.navOrder),
      database.prepare(
        `INSERT OR IGNORE INTO knowledge_entry_revisions (
          id, entry_id, revision, slug, parent_id, product_key, entry_type, title, summary, body,
          version_label, publication_status, nav_order, change_kind, authored_by
        ) VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'published', ?11, 'publish', 'system-seed')`,
      ).bind(`revision-${document.id}-1`, document.id, fullSlug, parent?.id ?? null, document.productKey, document.entryType, document.title, document.summary, document.body, document.versionLabel, document.navOrder),
    );
  }

  const wikiDocumentByPath = new Map(
    gameWikiDocuments.map((document) => [`${document.spaceKey}/${document.slug}`, document]),
  );
  const spaceIdByKey = new Map(knowledgeSpaces.map((space) => [space.key, space.id]));
  for (const document of gameWikiDocuments) {
    const parent = document.parentSlug
      ? wikiDocumentByPath.get(`${document.spaceKey}/${document.parentSlug}`)
      : null;
    seedStatements.push(
      database.prepare(
        `INSERT OR IGNORE INTO knowledge_entries (
          id, space_id, slug, parent_id, product_key, entry_type, title, summary, body,
          version_label, publication_status, nav_order, revision, published_revision, created_by, updated_by
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'internal', 'draft', ?10, 1, NULL, 'system-seed', 'system-seed')`,
      ).bind(document.id, spaceIdByKey.get(document.spaceKey), document.slug, parent?.id ?? null, document.projectKey, document.entryType, document.title, document.summary, document.body, document.navOrder),
      database.prepare(
        `INSERT OR IGNORE INTO knowledge_entry_revisions (
          id, entry_id, revision, slug, parent_id, product_key, entry_type, title, summary, body,
          version_label, publication_status, nav_order, change_kind, authored_by
        ) VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'internal', 'draft', ?10, 'create', 'system-seed')`,
      ).bind(`revision-${document.id}-1`, document.id, document.slug, parent?.id ?? null, document.projectKey, document.entryType, document.title, document.summary, document.body, document.navOrder),
    );
  }

  await database.batch(seedStatements);
  const thresholdOverview = sdkDocuments.find((document) => document.id === "docs-threshold-overview");
  if (thresholdOverview) {
    await database.batch([
      database.prepare(
        `INSERT OR IGNORE INTO knowledge_entry_revisions (
          id, entry_id, revision, slug, parent_id, product_key, entry_type, title, summary, body,
          version_label, publication_status, nav_order, change_kind, authored_by
        ) VALUES ('revision-docs-threshold-overview-2', ?1, 2, ?2, NULL, ?3, ?4, ?5, ?6, ?7, ?8, 'published', ?9, 'publish', 'system-migration')`,
      ).bind(thresholdOverview.id, `${thresholdOverview.productKey}/${thresholdOverview.slug}`, thresholdOverview.productKey,
        thresholdOverview.entryType, thresholdOverview.title, thresholdOverview.summary, thresholdOverview.body,
        thresholdOverview.versionLabel, thresholdOverview.navOrder),
      database.prepare(
        `UPDATE knowledge_entries
         SET title=?1, summary=?2, body=?3, revision=2, published_revision=2,
           updated_by='system-migration', updated_at=CURRENT_TIMESTAMP
         WHERE id='docs-threshold-overview' AND revision=1 AND updated_by='system-seed'`,
      ).bind(thresholdOverview.title, thresholdOverview.summary, thresholdOverview.body),
    ]);
  }
  await database.prepare(
    `UPDATE knowledge_entries
     SET publication_status='archived', published_revision=NULL, updated_by='system-migration', updated_at=CURRENT_TIMESTAMP
     WHERE space_id='space-sdk-docs' AND product_key='atrium' AND updated_by='system-seed'`,
  ).run();
  await database.prepare(
    `INSERT OR IGNORE INTO knowledge_entries (
      id, space_id, slug, parent_id, product_key, entry_type, title, summary, body,
      version_label, publication_status, nav_order, revision, published_revision, created_by, updated_by,
      created_at, updated_at
    )
    SELECT id, 'space-splinterheart-lore', slug, NULL, project_key, 'lore', title, summary, body,
      'internal', CASE WHEN record_status = 'archived' THEN 'archived' ELSE 'draft' END,
      100, revision, NULL, created_by, updated_by, created_at, updated_at
    FROM lore_entries`,
  ).run();
}

export function getD1(): D1Database {
  if (!env.DB) throw new Error("Workbench database binding is unavailable.");
  return env.DB;
}

export async function ensureWorkbenchSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const database = getD1();
      await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
      await seedKnowledge(database);
      await database.prepare("PRAGMA optimize").run();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export type WorkbenchMetrics = {
  privateEntries: number;
  publishedDocs: number;
  docDrafts: number;
  activeMembers: number;
};

export async function getWorkbenchMetrics(): Promise<WorkbenchMetrics> {
  await ensureWorkbenchSchema();
  const database = getD1();
  const [privateEntries, publishedDocs, docDrafts, activeMembers] = await database.batch([
    database.prepare("SELECT COUNT(*) AS count FROM knowledge_entries entries JOIN knowledge_spaces spaces ON spaces.id = entries.space_id WHERE spaces.visibility = 'private' AND entries.publication_status != 'archived'"),
    database.prepare("SELECT COUNT(*) AS count FROM knowledge_entries WHERE space_id = 'space-sdk-docs' AND publication_status = 'published'"),
    database.prepare("SELECT COUNT(*) AS count FROM knowledge_entries WHERE space_id = 'space-sdk-docs' AND publication_status IN ('draft','review')"),
    database.prepare("SELECT COUNT(*) AS count FROM studio_members WHERE status = 'active'"),
  ]);

  return {
    privateEntries: Number((privateEntries.results[0] as { count?: number } | undefined)?.count ?? 0),
    publishedDocs: Number((publishedDocs.results[0] as { count?: number } | undefined)?.count ?? 0),
    docDrafts: Number((docDrafts.results[0] as { count?: number } | undefined)?.count ?? 0),
    activeMembers: Number((activeMembers.results[0] as { count?: number } | undefined)?.count ?? 0),
  };
}
