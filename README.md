# VASTFRAME Website

The public VASTFRAME studio website and private developer Workbench.

## Product shape

- Public routes present VASTFRAME as a game studio. Splinterheart is the only listed game.
- The SDK route introduces Threshold, Eclipse, Firmament, and Causality as technology built beneath the games.
- Development updates belong on Steam rather than a studio-owned blog.
- The Workbench owns private lore editing, revision history and restore, relationships, archiving, membership authorization, audit records, and portable lore backups.

The public site never depends on Workbench data to render. Authentication identifies a visitor; an active `studio_members` row authorizes Workbench access.

## Development

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
pnpm test
```

The site uses the Sites-compatible Vinext starter and Cloudflare D1. `.openai/hosting.json` declares the logical `DB` binding. Drizzle schema lives in `db/schema.ts`; generated migrations live in `drizzle/`.

Hosted previews use the `SITE_ACCESS_PASSWORD` secret as a lightweight whole-site sharing gate. Successful entry creates a signed, HttpOnly, seven-day cookie; rotating the secret invalidates existing cookies. When the secret is absent, such as ordinary local development, the gate is disabled. This sharing password is intentionally separate from Workbench identity and membership authorization.

Local development exposes a clearly labeled preview identity so the Workbench can be reviewed without production credentials. Production builds never grant that identity. Administrators invite collaborators by verified email; the invitation activates on first successful sign-in.

Lore records support search, type/canon/archive filters, optimistic revision checks, immutable history, snapshot inspection and restore, archive/restore revisions, and directed relationships. Viewers are read-only; contributors can write; editors can manage record lifecycle; administrators also manage membership, audit review, and export.

Every Workbench mutation requires an application-only same-origin request marker and creates an attributable audit event. See `Documentation/Workbench-Operations.md` for first-administrator bootstrap, roles, backup, and incident guidance.

## Placeholder media

All unfinished imagery uses the shared `MediaPlaceholder` component. Each slot carries a stable identifier and aspect ratio. Grey, pink, and checkerboard blocks are deliberate pre-publication assets, not simulated gameplay screenshots.

Before making the public deployment reachable, replace all required slots and add final social-preview and favicon assets.

The current build also emits crawler blocks because VASTFRAME intends to keep the site private until those assets are ready. Crawler directives are not a substitute for private hosting.

## Operations

This is the authoritative `VAST-FRAME-Website` repository. The Sites project ID, D1 binding declaration, and generated migrations travel with the source; passwords and other runtime values stay in hosted secrets.

See `Documentation/Architecture.md` for the public/private boundary, `Documentation/Workbench-Operations.md` for Workbench guidance, and `Documentation/Handoff.md` for deployment and domain operations.

Current desktop and mobile review captures live in `Documentation/Screenshots/`.
