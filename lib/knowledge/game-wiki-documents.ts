import type { KnowledgeEntryType, KnowledgeSpaceKey } from "./model";

export type GameWikiDocument = {
  id: string;
  spaceKey: Extract<KnowledgeSpaceKey, "splinterheart-lore" | "snowfall-lore">;
  slug: string;
  parentSlug: string | null;
  projectKey: "splinterheart" | "snowfall";
  entryType: KnowledgeEntryType;
  title: string;
  summary: string;
  body: string;
  navOrder: number;
};

function category(
  slug: string,
  title: string,
  summary: string,
  navOrder: number,
): GameWikiDocument {
  return {
    id: `wiki-splinterheart-category-${slug}`,
    spaceKey: "splinterheart-lore",
    slug,
    parentSlug: null,
    projectKey: "splinterheart",
    entryType: "category",
    title,
    summary,
    body: `# ${title}\n\n${summary}\n\nThis category is an index for future Splinterheart wiki entries.`,
    navOrder,
  };
}

export const gameWikiDocuments: readonly GameWikiDocument[] = [
  category("characters", "Characters", "Principal characters and other named people in Splinterheart.", 100),
  {
    id: "wiki-splinterheart-character-block",
    spaceKey: "splinterheart-lore",
    slug: "characters/block",
    parentSlug: "characters",
    projectKey: "splinterheart",
    entryType: "character",
    title: "Block",
    summary: "The main character of Splinterheart, also known as Splinterheart himself.",
    body: "# Block\n\nBlock is the main character of Splinterheart and the figure known as Splinterheart himself.\n\n## Role\n\nBlock is the central character through whom the story and combat are experienced.\n\n## Open questions\n\n- What made Block become Splinterheart?\n- How does Block change over the course of the story?\n- What parts of his history should the player learn directly?",
    navOrder: 110,
  },
  category("enemies", "Enemies", "Enemy archetypes, behaviors, combat roles, and presentation.", 200),
  {
    id: "wiki-splinterheart-enemy-rake",
    spaceKey: "splinterheart-lore",
    slug: "enemies/rake",
    parentSlug: "enemies",
    projectKey: "splinterheart",
    entryType: "enemy",
    title: "Rake",
    summary: "A heavy enemy in Splinterheart.",
    body: "# Rake\n\nRake is a heavy enemy.\n\n## Combat role\n\nRake belongs to the heavy enemy class and should read as a substantial threat.\n\n## Open questions\n\n- What distinguishes Rake from lighter enemies?\n- What attacks, defenses, and vulnerabilities define the encounter?\n- How should Rake interact with electrical arcs and environmental hazards?",
    navOrder: 210,
  },
  {
    id: "wiki-splinterheart-enemy-inquisitor",
    spaceKey: "splinterheart-lore",
    slug: "enemies/inquisitor",
    parentSlug: "enemies",
    projectKey: "splinterheart",
    entryType: "enemy",
    title: "Inquisitor",
    summary: "A super-heavy enemy in Splinterheart.",
    body: "# Inquisitor\n\nInquisitor is a super-heavy enemy.\n\n## Combat role\n\nInquisitor belongs to the super-heavy enemy class and should command attention when present.\n\n## Open questions\n\n- What makes Inquisitor distinct from Wraith?\n- What attacks, defenses, and vulnerabilities define the encounter?\n- What visual language communicates the super-heavy class?",
    navOrder: 220,
  },
  {
    id: "wiki-splinterheart-enemy-wraith",
    spaceKey: "splinterheart-lore",
    slug: "enemies/wraith",
    parentSlug: "enemies",
    projectKey: "splinterheart",
    entryType: "enemy",
    title: "Wraith",
    summary: "A super-heavy enemy in Splinterheart.",
    body: "# Wraith\n\nWraith is a super-heavy enemy.\n\n## Combat role\n\nWraith belongs to the super-heavy enemy class and should command attention when present.\n\n## Open questions\n\n- What makes Wraith distinct from Inquisitor?\n- What attacks, defenses, and vulnerabilities define the encounter?\n- How literal or figurative is the name Wraith?",
    navOrder: 230,
  },
  category("weapons", "Weapons", "Acquirable combat tools and their systemic interactions.", 300),
  {
    id: "wiki-splinterheart-weapon-staple-cannon",
    spaceKey: "splinterheart-lore",
    slug: "weapons/staple-cannon",
    parentSlug: "weapons",
    projectKey: "splinterheart",
    entryType: "weapon",
    title: "Staple Cannon",
    summary: "Fires staples that attach to enemies and surfaces, creating touch points for electrical arcs.",
    body: "# Staple Cannon\n\nThe Staple Cannon fires staples that attach to enemies and surfaces. Attached staples become touch points for electrical arcs.\n\n## Core behavior\n\n- Fires physical staples.\n- Staples remain attached to enemies or world surfaces.\n- Attached staples create new touch points for electrical arcs.\n\n## Open questions\n\n- How many staples may remain active?\n- What removes or expires a staple?\n- How clearly should valid arc touch points be communicated?",
    navOrder: 310,
  },
  {
    id: "wiki-splinterheart-weapon-arc-launcher",
    spaceKey: "splinterheart-lore",
    slug: "weapons/arc-launcher",
    parentSlug: "weapons",
    projectKey: "splinterheart",
    entryType: "weapon",
    title: "Arc Launcher",
    summary: "A weapon that fires electrical arcs.",
    body: "# Arc Launcher\n\nThe Arc Launcher fires electrical arcs.\n\n## Core behavior\n\n- Produces electrical arc attacks.\n- Participates in the game's conductive and touch-point systems.\n\n## Open questions\n\n- How does the player choose or influence an arc path?\n- How does it interact with staples, enemies, and conductive surfaces?\n- What limits its range and repeated use?",
    navOrder: 320,
  },
  {
    id: "wiki-splinterheart-weapon-minigun",
    spaceKey: "splinterheart-lore",
    slug: "weapons/minigun",
    parentSlug: "weapons",
    projectKey: "splinterheart",
    entryType: "weapon",
    title: "Minigun",
    summary: "A rapid-fire weapon that shoots metal BBs.",
    body: "# Minigun\n\nThe Minigun fires metal BBs.\n\n## Core behavior\n\n- Fires metal projectiles at a high rate.\n- Its ammunition can participate in systems that respond to metal.\n\n## Open questions\n\n- How do spread, spin-up, heat, and ammunition shape its use?\n- What happens to BBs after impact?\n- Which systemic interactions depend on the projectiles being metal?",
    navOrder: 330,
  },
  {
    id: "wiki-splinterheart-weapon-shotgun",
    spaceKey: "splinterheart-lore",
    slug: "weapons/shotgun",
    parentSlug: "weapons",
    projectKey: "splinterheart",
    entryType: "weapon",
    title: "Shotgun",
    summary: "Fires metal BBs that are superheated into shrapnel with each shot.",
    body: "# Shotgun\n\nThe Shotgun fires metal BBs that are superheated into shrapnel with each shot.\n\n## Core behavior\n\n- Fires a spread of metal BBs.\n- Each shot superheats the BBs into shrapnel.\n- The ammunition can participate in systems that respond to heat or metal.\n\n## Open questions\n\n- How long does the shrapnel remain hot?\n- What can it ignite, melt, or conduct through?\n- How should its effective range differ from the Minigun?",
    navOrder: 340,
  },
  {
    id: "wiki-splinterheart-weapon-fists",
    spaceKey: "splinterheart-lore",
    slug: "weapons/fists",
    parentSlug: "weapons",
    projectKey: "splinterheart",
    entryType: "weapon",
    title: "Fists",
    summary: "An acquired melee weapon that occupies a place on the weapon wheel like every other weapon.",
    body: "# Fists\n\nFists are a melee weapon. They must be acquired like any other weapon and participate in the weapon wheel.\n\n## Core behavior\n\n- Provides a melee attack.\n- Is not available automatically; it must be acquired.\n- Occupies a normal place in the weapon wheel.\n\n## Open questions\n\n- Why must Block acquire his fists?\n- What makes them competitive with ranged weapons?\n- Which environmental or systemic interactions are unique to melee contact?",
    navOrder: 350,
  },
  category("locations", "Locations", "Places, regions, encounter spaces, and environmental context.", 400),
  category("factions", "Factions", "Organizations, allegiances, and competing groups.", 500),
  category("story", "Story", "Narrative structure, events, themes, and continuity.", 600),
  category("systems", "Systems", "Game rules and interactions that connect content across the world.", 700),
  category("production", "Production", "Internal decisions, references, ownership, and implementation notes.", 800),
] as const;
