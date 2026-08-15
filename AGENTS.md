# VASTFRAME Website Automation Contract

This repository owns the public VASTFRAME studio website and its private developer Workbench.

## Product boundaries

- The public site is games-first. Splinterheart is the only publicly listed game until the studio explicitly announces another.
- Threshold, Atrium, Eclipse, and Causality appear as technology made in service of VASTFRAME games.
- Atrium is the canonical sky-system name. Do not preserve or surface superseded names in copy, routes, metadata, redirects, seed content, or media identifiers.
- The Workbench is a separate authenticated surface. Never expose drafts, lore, membership data, internal notes, or unpublished media through public routes or client bundles.
- Public publication must be an explicit state transition. `draft`, `review`, and `scheduled` records are private.
- Authentication identifies a person; the Workbench membership table authorizes access. Never equate a valid external identity with studio membership.
- GitHub organization membership is not an authentication or authorization requirement.
- Keep the optional shared preview password at the Worker boundary and in the hosted `SITE_ACCESS_PASSWORD` secret. Never commit it or treat it as Workbench identity.
- Keep first-administrator bootstrap constrained to the verified `WORKBENCH_BOOTSTRAP_EMAIL` and an empty membership table; all later access uses explicit invitations.

## Content and media

- Placeholder media is deliberate product UI. Use the shared placeholder component with a stable slot ID, aspect ratio, and replacement state.
- Do not imply placeholder art is a gameplay screenshot.
- Preserve stable public slugs once published.
- Do not invent game lore, dates, platforms, features, or release commitments.

## Engineering

- Keep public pages renderable without Workbench data or authentication services.
- Keep authorization checks server-side for every protected read and write.
- Every lore content, canon-state, archive, or restore mutation must create an attributable revision.
- Every consequential Workbench mutation must also create an attributable audit event and enforce the same-origin mutation request contract.
- Relationship mutations must retain an attributable creator, and membership mutations remain administrator-only.
- Lore export remains administrator-only and excludes membership data. Do not add destructive import or hard-delete workflows without explicit approval and a recovery design.
- Use D1 for structured Workbench state and R2 only when real uploads are implemented.
- Maintain accessible landmarks, keyboard behavior, focus states, reduced-motion behavior, and responsive layouts.
- Run the production build and focused tests before claiming completion.
