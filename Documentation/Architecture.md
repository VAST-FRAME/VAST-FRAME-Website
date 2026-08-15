# Website architecture

## Surfaces

The site has two deliberately separate surfaces:

1. The public studio site is a static, games-first presentation. It currently names only Splinterheart. It must remain available even if Workbench services are unavailable.
2. `/workbench` is an internal application for studio knowledge and editorial work. Every protected read and mutation performs server-side authorization.

Shared styling is intentional; shared data access is not. Public routes do not query private tables.

## Identity and membership

The hosted public surface may be placed behind a lightweight shared-password gate at the Worker boundary. The password lives only in the hosted `SITE_ACCESS_PASSWORD` secret. The gate prevents casual access and disables shared caching; it is not individual identity or a replacement for Workbench authorization.

The current Sites runtime supplies verified identity headers after secure sign-in. VASTFRAME authorization is independent of that identity provider: an authenticated email must also have an invited or active row in `studio_members`. An invitation becomes active on that email's first verified sign-in. Roles are `admin`, `editor`, `contributor`, and `viewer`.

GitHub organization membership is never consulted. If VASTFRAME later chooses an independent email magic-link provider, replace the identity adapter in `lib/workbench/auth.ts` while preserving the membership and role checks.

Local development uses a visibly labelled preview administrator. That fallback is gated by `NODE_ENV === "development"` and cannot authorize a production build.

## Durable state

Cloudflare D1 is bound as `DB`. The first schema covers:

- membership and roles;
- lore records and immutable revisions;
- typed lore relationships;
- an attributable audit trail for consequential Workbench mutations.

Lore writes use optimistic revision checks so one editor cannot silently overwrite another. Content edits, archive, lifecycle restore, and historical snapshot restore operations create attributable revisions. Relationship records have attributable creators and are editable from the lore workspace. Every mutation requires the Workbench request marker and passes same-origin browser checks before authorization.

Administrators can export a versioned JSON document containing all lore entries, revisions, and relationships. Membership is excluded. The application intentionally has no bulk import or hard-delete endpoint; ordinary editorial recovery creates a new revision from an inspected snapshot.

## Steam updates

VASTFRAME does not operate a separate studio blog. Game development updates will live on Steam once Splinterheart has a public store page. The website contains no editorial publishing system or private post table.

## Media

`MediaPlaceholder` provides stable slot names and ratios. Placeholder blocks are intentionally obvious and never presented as screenshots. Screenshot automation is deferred until VASTFRAME's SDK capture system is ready to provide deterministic game output.

## Privacy before launch

The root metadata emits `noindex`, `nofollow`, and `nocache`; `/robots.txt` disallows crawling. These are safeguards, not access control. Keep the deployment private at the hosting layer until real media and launch copy are approved.
