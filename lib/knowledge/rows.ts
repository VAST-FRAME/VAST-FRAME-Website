import type { KnowledgeEntry, KnowledgeRevision, KnowledgeSpaceKey } from "./model";

export type KnowledgeRow = {
  id: string; space_key: KnowledgeSpaceKey; slug: string; parent_id: string | null; product_key: string | null;
  entry_type: KnowledgeEntry["entryType"]; title: string; summary: string; body: string; version_label: string;
  publication_status: KnowledgeEntry["publicationStatus"]; nav_order: number; revision: number;
  published_revision: number | null; updated_by: string; updated_at: string;
};

export function mapKnowledgeRow(row: KnowledgeRow): KnowledgeEntry {
  return { id: row.id, spaceKey: row.space_key, slug: row.slug, parentSlug: row.parent_id, productKey: row.product_key,
    entryType: row.entry_type, title: row.title, summary: row.summary, body: row.body, versionLabel: row.version_label,
    publicationStatus: row.publication_status, navOrder: row.nav_order, revision: row.revision,
    publishedRevision: row.published_revision, updatedBy: row.updated_by, updatedAt: row.updated_at };
}

export type KnowledgeRevisionRow = Omit<KnowledgeRow, "space_key" | "published_revision" | "updated_by" | "updated_at"> & {
  revision_id: string; change_kind: KnowledgeRevision["changeKind"]; authored_by: string; created_at: string;
};

export function mapKnowledgeRevisionRow(row: KnowledgeRevisionRow, spaceKey: KnowledgeSpaceKey): KnowledgeRevision {
  return { ...mapKnowledgeRow({ ...row, space_key: spaceKey, published_revision: null, updated_by: row.authored_by, updated_at: row.created_at }),
    revisionId: row.revision_id, changeKind: row.change_kind, authoredBy: row.authored_by, createdAt: row.created_at };
}
