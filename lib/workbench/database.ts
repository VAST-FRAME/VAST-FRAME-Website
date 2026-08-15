import { env } from "cloudflare:workers";

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

export function getD1(): D1Database {
  if (!env.DB) throw new Error("Workbench database binding is unavailable.");
  return env.DB;
}

export async function ensureWorkbenchSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const database = getD1();
      await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
      await database.prepare("PRAGMA optimize").run();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export type WorkbenchMetrics = {
  activeEntries: number;
  canonEntries: number;
  relationships: number;
  activeMembers: number;
};

export async function getWorkbenchMetrics(): Promise<WorkbenchMetrics> {
  await ensureWorkbenchSchema();
  const database = getD1();
  const [activeEntries, canonEntries, relationships, activeMembers] = await database.batch([
    database.prepare("SELECT COUNT(*) AS count FROM lore_entries WHERE record_status = 'active'"),
    database.prepare("SELECT COUNT(*) AS count FROM lore_entries WHERE record_status = 'active' AND canon_status = 'canon'"),
    database.prepare("SELECT COUNT(*) AS count FROM lore_links"),
    database.prepare("SELECT COUNT(*) AS count FROM studio_members WHERE status = 'active'"),
  ]);

  return {
    activeEntries: Number((activeEntries.results[0] as { count?: number } | undefined)?.count ?? 0),
    canonEntries: Number((canonEntries.results[0] as { count?: number } | undefined)?.count ?? 0),
    relationships: Number((relationships.results[0] as { count?: number } | undefined)?.count ?? 0),
    activeMembers: Number((activeMembers.results[0] as { count?: number } | undefined)?.count ?? 0),
  };
}
