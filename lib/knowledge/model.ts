export const knowledgeSpaceKeys = ["splinterheart-lore", "snowfall-lore", "sdk-docs"] as const;
export type KnowledgeSpaceKey = (typeof knowledgeSpaceKeys)[number];
export type KnowledgeVisibility = "private" | "public";
export type PublicationStatus = "draft" | "review" | "published" | "archived";
export type KnowledgeEntryType =
  | "overview"
  | "concept"
  | "guide"
  | "reference"
  | "lore"
  | "category"
  | "character"
  | "enemy"
  | "weapon"
  | "location"
  | "faction"
  | "story"
  | "system"
  | "production";

export type KnowledgeSpace = {
  id: string;
  key: KnowledgeSpaceKey;
  title: string;
  description: string;
  visibility: KnowledgeVisibility;
};

export type KnowledgeEntry = {
  id: string;
  spaceKey: KnowledgeSpaceKey;
  slug: string;
  parentSlug: string | null;
  productKey: string | null;
  entryType: KnowledgeEntryType;
  title: string;
  summary: string;
  body: string;
  versionLabel: string;
  publicationStatus: PublicationStatus;
  navOrder: number;
  revision: number;
  publishedRevision: number | null;
  updatedBy: string;
  updatedAt: string;
};

export type KnowledgeRevision = KnowledgeEntry & {
  revisionId: string;
  changeKind: "create" | "edit" | "submit_review" | "publish" | "archive" | "revision_restore";
  authoredBy: string;
  createdAt: string;
};

export type KnowledgeRelationship = {
  id: string;
  direction: "outgoing" | "incoming";
  relationship: string;
  entryId: string;
  entryTitle: string;
  entryType: string;
};

export const knowledgeSpaces: readonly KnowledgeSpace[] = [
  {
    id: "space-splinterheart-lore",
    key: "splinterheart-lore",
    title: "Splinterheart wiki",
    description: "Private characters, enemies, weapons, story, systems, and production knowledge.",
    visibility: "private",
  },
  {
    id: "space-snowfall-lore",
    key: "snowfall-lore",
    title: "Snowfall wiki",
    description: "Private worldbuilding, narrative, gameplay, and production knowledge for Snowfall.",
    visibility: "private",
  },
  {
    id: "space-sdk-docs",
    key: "sdk-docs",
    title: "SDK documentation",
    description: "Public technical documentation with a private editorial workflow.",
    visibility: "public",
  },
] as const;

export function knowledgeSlug(value: string): string {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "entry";
}
