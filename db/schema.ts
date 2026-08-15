import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const studioMembers = sqliteTable(
  "studio_members",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role", { enum: ["admin", "editor", "contributor", "viewer"] }).notNull(),
    status: text("status", { enum: ["invited", "active", "disabled"] }).notNull(),
    invitedBy: text("invited_by"),
    lastSeenAt: text("last_seen_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_studio_members_email").on(table.email)],
);

export const loreEntries = sqliteTable(
  "lore_entries",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    projectKey: text("project_key").notNull(),
    entryType: text("entry_type").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    canonStatus: text("canon_status", {
      enum: ["idea", "draft", "canon", "deprecated", "contradictory"],
    }).notNull(),
    recordStatus: text("record_status", { enum: ["active", "archived"] }).notNull(),
    revision: integer("revision").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_lore_entries_slug").on(table.slug),
    index("idx_lore_entries_project_status").on(table.projectKey, table.recordStatus),
    index("idx_lore_entries_updated_at").on(table.updatedAt),
  ],
);

export const loreEntryRevisions = sqliteTable(
  "lore_entry_revisions",
  {
    id: text("id").primaryKey(),
    entryId: text("entry_id").notNull(),
    revision: integer("revision").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    canonStatus: text("canon_status").notNull(),
    entryType: text("entry_type").notNull(),
    recordStatus: text("record_status").notNull(),
    changeKind: text("change_kind", { enum: ["create", "edit", "archive", "restore", "revision_restore"] }).notNull(),
    authoredBy: text("authored_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_lore_revisions_entry_revision").on(table.entryId, table.revision),
    index("idx_lore_revisions_created_at").on(table.createdAt),
  ],
);

export const loreLinks = sqliteTable(
  "lore_links",
  {
    id: text("id").primaryKey(),
    sourceEntryId: text("source_entry_id").notNull(),
    targetEntryId: text("target_entry_id").notNull(),
    relationship: text("relationship").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_lore_links_identity").on(
      table.sourceEntryId,
      table.targetEntryId,
      table.relationship,
    ),
    index("idx_lore_links_target").on(table.targetEntryId),
  ],
);

export const workbenchAuditEvents = sqliteTable(
  "workbench_audit_events",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").notNull(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary").notNull(),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_audit_events_created_at").on(table.createdAt),
    index("idx_audit_events_actor_created").on(table.actorEmail, table.createdAt),
    index("idx_audit_events_entity_created").on(table.entityType, table.entityId, table.createdAt),
  ],
);
