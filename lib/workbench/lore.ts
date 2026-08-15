export const loreEntryTypes = [
  "Character",
  "Location",
  "Faction",
  "Creature",
  "Item",
  "Technology",
  "Event",
  "Narrative thread",
  "Terminology",
  "Gameplay concept",
] as const;

export const loreCanonStatuses = [
  "idea",
  "draft",
  "canon",
  "deprecated",
  "contradictory",
] as const;

export type LoreCanonStatus = (typeof loreCanonStatuses)[number];
export type LoreRecordStatus = "active" | "archived";
export type LoreChangeKind = "create" | "edit" | "archive" | "restore" | "revision_restore";

export type LoreEntry = {
  id: string;
  slug: string;
  projectKey: string;
  entryType: string;
  title: string;
  summary: string;
  body: string;
  canonStatus: LoreCanonStatus;
  recordStatus: LoreRecordStatus;
  revision: number;
  updatedBy: string;
  updatedAt: string;
};

export type LoreRevision = {
  id: string;
  revision: number;
  title: string;
  summary: string;
  body: string;
  entryType: string;
  canonStatus: LoreCanonStatus;
  recordStatus: LoreRecordStatus;
  changeKind: LoreChangeKind;
  authoredBy: string;
  createdAt: string;
};

export type LoreRelationship = {
  id: string;
  direction: "outgoing" | "incoming";
  relationship: string;
  entryId: string;
  entryTitle: string;
  entryType: string;
};

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "entry";
}
