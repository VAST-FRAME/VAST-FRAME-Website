import { sdkDocuments } from "./sdk-documents";

export type PublicSdkDocument = {
  id: string; slug: string; parentSlug: string | null; productKey: string; entryType: string;
  title: string; summary: string; body: string; versionLabel: string; navOrder: number; publishedRevision: number;
};

const fallbackDocuments: PublicSdkDocument[] = sdkDocuments.map((document) => ({
  id: document.id, slug: document.slug, parentSlug: document.parentSlug, productKey: document.productKey!,
  entryType: document.entryType, title: document.title, summary: document.summary, body: document.body,
  versionLabel: document.versionLabel, navOrder: document.navOrder, publishedRevision: 1,
}));

type PublicDocumentRow = {
  id: string; slug: string; parent_slug: string | null; product_key: string; entry_type: string; title: string;
  summary: string; body: string; version_label: string; nav_order: number; published_revision: number;
};

export async function getPublicSdkDocuments(): Promise<PublicSdkDocument[]> {
  try {
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    await ensureWorkbenchSchema();
    const result = await getD1().prepare(
      `SELECT entries.id, substr(revisions.slug, instr(revisions.slug, '/') + 1) AS slug,
        parent.slug AS parent_slug, revisions.product_key, revisions.entry_type, revisions.title,
        revisions.summary, revisions.body, revisions.version_label, revisions.nav_order,
        entries.published_revision
       FROM knowledge_entries entries
       JOIN knowledge_spaces spaces ON spaces.id = entries.space_id AND spaces.visibility = 'public'
       JOIN knowledge_entry_revisions revisions ON revisions.entry_id = entries.id AND revisions.revision = entries.published_revision
       LEFT JOIN knowledge_entries parent ON parent.id = revisions.parent_id
       WHERE entries.published_revision IS NOT NULL
       ORDER BY revisions.product_key, revisions.nav_order, revisions.title`,
    ).all<PublicDocumentRow>();
    if (result.results.length === 0) return fallbackDocuments;
    return result.results.map((row) => ({ id: row.id, slug: row.slug, parentSlug: row.parent_slug, productKey: row.product_key,
      entryType: row.entry_type, title: row.title, summary: row.summary, body: row.body, versionLabel: row.version_label,
      navOrder: row.nav_order, publishedRevision: row.published_revision }));
  } catch {
    return fallbackDocuments;
  }
}

export async function publicDocumentsForProduct(productKey: string) {
  return (await getPublicSdkDocuments()).filter((document) => document.productKey === productKey).sort((a, b) => a.navOrder - b.navOrder);
}

export async function findPublicSdkDocument(productKey: string, slug = "overview") {
  return (await getPublicSdkDocuments()).find((document) => document.productKey === productKey && document.slug === slug);
}

export async function searchPublicSdkDocuments(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return (await getPublicSdkDocuments()).filter((document) => {
    const haystack = `${document.title} ${document.summary} ${document.body} ${document.productKey}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
