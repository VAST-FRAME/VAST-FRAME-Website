# Deployment and domain operations

This repository is the authoritative source for the VASTFRAME website. Sites owns the production Worker, D1 database, runtime secrets, and generated deployment URL.

## Publishing

1. Run the production build and automated tests.
2. Confirm `.openai/hosting.json` contains the existing Sites `project_id` and logical `DB` binding.
3. Confirm generated migrations are committed.
4. Save and deploy the exact committed source through Sites.
5. Keep Sites access public while `SITE_ACCESS_PASSWORD` is configured; the Worker-level sharing gate then protects every page and API route.

Changing `SITE_ACCESS_PASSWORD` immediately invalidates previously issued access cookies. Removing it disables the sharing gate, so do that only when the public launch is intentional.

## Workbench readiness

Configure `WORKBENCH_BOOTSTRAP_EMAIL` before the first production sign-in. Its verified owner may claim the first administrator role only while the membership table is empty. The reviewed SQL procedure in `Workbench-Operations.md` remains the recovery path. Valid external identity alone must never create studio membership.

Before schema changes or risky editorial work, download a lore backup from Workbench Operations. Never copy `.wrangler` local state into production.

## Custom domain

The legacy GitHub Pages `CNAME` file is no longer used. Attach `www.vastframe.com` through Sites, then apply the exact DNS validation and CNAME records Sites provides. Keep the generated Sites URL available as a fallback until the custom hostname reports active with valid TLS.

Do not remove crawler blocks, the password gate, or placeholder warnings until real media and launch copy are approved.
