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

export const commercialProducts = sqliteTable("commercial_products", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  availability: text("availability", { enum: ["development", "available", "planned", "retired"] }).notNull(),
  priceLabel: text("price_label").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerUsers = sqliteTable(
  "customer_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    lastSeenAt: text("last_seen_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_customer_users_email").on(table.email)],
);

export const customerOrganizations = sqliteTable("customer_organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerOrganizationMemberships = sqliteTable(
  "customer_organization_memberships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
    status: text("status", { enum: ["invited", "active", "disabled"] }).notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_customer_memberships_organization_user").on(table.organizationId, table.userId),
    index("idx_customer_memberships_user_status").on(table.userId, table.status),
  ],
);

export const productLicenses = sqliteTable(
  "product_licenses",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    productKey: text("product_key").notNull(),
    state: text("state", { enum: ["active", "refunded", "revoked"] }).notNull(),
    assignmentStatus: text("assignment_status", { enum: ["unassigned", "development", "released"] }).notNull(),
    assignedTitle: text("assigned_title"),
    purchasedAt: text("purchased_at").notNull(),
    updatesEndAt: text("updates_end_at").notNull(),
    releasedAt: text("released_at"),
    externalOrderId: text("external_order_id"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_product_licenses_organization_state").on(table.organizationId, table.state),
    index("idx_product_licenses_product_state").on(table.productKey, table.state),
  ],
);

export const productReleases = sqliteTable(
  "product_releases",
  {
    id: text("id").primaryKey(),
    productKey: text("product_key").notNull(),
    version: text("version").notNull(),
    channel: text("channel", { enum: ["stable", "preview"] }).notNull(),
    status: text("status", { enum: ["draft", "published", "withdrawn"] }).notNull(),
    unityVersion: text("unity_version").notNull(),
    filename: text("filename").notNull(),
    objectKey: text("object_key").notNull(),
    contentType: text("content_type").notNull().default("application/gzip"),
    sizeBytes: integer("size_bytes").notNull(),
    checksumSha256: text("checksum_sha256").notNull(),
    releaseNotes: text("release_notes").notNull().default(""),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_product_releases_product_version_channel").on(table.productKey, table.version, table.channel),
    index("idx_product_releases_product_status_published").on(table.productKey, table.status, table.publishedAt),
  ],
);

export const customerOrders = sqliteTable(
  "customer_orders",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    provider: text("provider").notNull(),
    externalOrderId: text("external_order_id").notNull(),
    status: text("status", { enum: ["pending", "paid", "refunded", "failed"] }).notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_customer_orders_provider_external").on(table.provider, table.externalOrderId),
    index("idx_customer_orders_organization_created").on(table.organizationId, table.createdAt),
  ],
);

export const productDownloadEvents = sqliteTable(
  "product_download_events",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    releaseId: text("release_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_product_download_events_organization_created").on(table.organizationId, table.createdAt)],
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

export const knowledgeSpaces = sqliteTable(
  "knowledge_spaces",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    visibility: text("visibility", { enum: ["private", "public"] }).notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_knowledge_spaces_key").on(table.key)],
);

export const knowledgeEntries = sqliteTable(
  "knowledge_entries",
  {
    id: text("id").primaryKey(),
    spaceId: text("space_id").notNull(),
    slug: text("slug").notNull(),
    parentId: text("parent_id"),
    productKey: text("product_key"),
    entryType: text("entry_type").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    versionLabel: text("version_label").notNull().default("0.x / development"),
    publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull(),
    navOrder: integer("nav_order").notNull().default(100),
    revision: integer("revision").notNull().default(1),
    publishedRevision: integer("published_revision"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_knowledge_entries_space_slug").on(table.spaceId, table.slug),
    index("idx_knowledge_entries_space_status_order").on(table.spaceId, table.publicationStatus, table.navOrder),
    index("idx_knowledge_entries_product_status").on(table.productKey, table.publicationStatus),
    index("idx_knowledge_entries_parent").on(table.parentId),
  ],
);

export const knowledgeEntryRevisions = sqliteTable(
  "knowledge_entry_revisions",
  {
    id: text("id").primaryKey(),
    entryId: text("entry_id").notNull(),
    revision: integer("revision").notNull(),
    slug: text("slug").notNull(),
    parentId: text("parent_id"),
    productKey: text("product_key"),
    entryType: text("entry_type").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    versionLabel: text("version_label").notNull(),
    publicationStatus: text("publication_status").notNull(),
    navOrder: integer("nav_order").notNull(),
    changeKind: text("change_kind", { enum: ["create", "edit", "submit_review", "publish", "archive", "revision_restore"] }).notNull(),
    authoredBy: text("authored_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_knowledge_revisions_entry_revision").on(table.entryId, table.revision),
    index("idx_knowledge_revisions_created_at").on(table.createdAt),
  ],
);

export const knowledgeLinks = sqliteTable(
  "knowledge_links",
  {
    id: text("id").primaryKey(),
    sourceEntryId: text("source_entry_id").notNull(),
    targetEntryId: text("target_entry_id").notNull(),
    relationship: text("relationship").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_knowledge_links_identity").on(table.sourceEntryId, table.targetEntryId, table.relationship),
    index("idx_knowledge_links_target").on(table.targetEntryId),
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
