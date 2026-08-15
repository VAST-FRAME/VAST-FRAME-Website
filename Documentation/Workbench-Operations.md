# Workbench operations

## First administrator

Authentication proves an email address; it never grants studio access on its own. After the D1 migration is applied, generate the one-time bootstrap statement locally:

```bash
pnpm workbench:admin-sql -- admin@example.com "Administrator Name"
```

Review the output, then execute it against the intended private D1 database using the hosting environment's authenticated database console or migration workflow. Confirm the database and environment before execution. The statement is idempotent for that email and intentionally promotes it to an active administrator.

After the first administrator signs in, create all other memberships from **Workbench → Members**. Do not make identity-provider accounts synonymous with Workbench access.

## Membership lifecycle

- `invited`: an administrator has approved the verified email, but it has not signed in yet.
- `active`: the invitation has been claimed and the member may use capabilities allowed by its role.
- `disabled`: sign-in may still identify the person, but Workbench authorization is denied.

The first verified sign-in activates an invitation and records that activation in the audit trail. The application prevents an administrator from removing their own active administrator access and prevents removal of the last active administrator.

## Roles

- `admin`: membership, audit, export, and every lore operation.
- `editor`: create/edit lore, relationships, archive/restore, and historical revision restore.
- `contributor`: create/edit lore and relationships; cannot change record lifecycle.
- `viewer`: read-only lore access.

Use the smallest role that lets a collaborator do their work.

## Backup and recovery

Administrators can download a versioned JSON backup from **Workbench → Operations**. It contains lore entries, their complete revision history, and relationships. It excludes membership and identity data.

Take a backup before risky editorial work and before schema or hosting changes. Store it in approved private storage outside the deployment account. A deliberately destructive self-service import endpoint is not included in this milestone: recovery should be reviewed, performed against a copy first, and executed through an operator-controlled database workflow.

Historical content mistakes normally do not require database recovery. Open the affected entry, select a prior revision, inspect its snapshot, and restore it as a new revision. The original history remains intact.

## Incident checklist

1. Disable affected memberships without deleting them.
2. Download a fresh lore backup if the data is still trustworthy.
3. Preserve the Workbench audit view and platform logs.
4. Rotate or revoke hosting/database access outside the application when appropriate.
5. Restore content through a new revision where possible; use database recovery only after validating a private copy.

The audit trail records consequential application mutations. It is operational evidence, not a substitute for provider logs or durable off-platform backups.
