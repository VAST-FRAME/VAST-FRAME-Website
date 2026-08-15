import { getChatGPTUser } from "@/app/chatgpt-auth";
import { prepareAuditEvent } from "./audit";

export type WorkbenchRole = "admin" | "editor" | "contributor" | "viewer";

export type WorkbenchIdentity = {
  id: string;
  email: string;
  displayName: string;
  source: "site" | "preview";
};

export type WorkbenchAccess = {
  identity: WorkbenchIdentity;
  role: WorkbenchRole;
  preview: boolean;
};

export async function getWorkbenchIdentity(): Promise<WorkbenchIdentity | null> {
  const siteUser = await getChatGPTUser();
  if (siteUser) {
    return {
      id: siteUser.userId,
      email: siteUser.email.toLowerCase(),
      displayName: siteUser.displayName,
      source: "site",
    };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      id: "local-preview",
      email: "preview@vastframe.local",
      displayName: "Local preview",
      source: "preview",
    };
  }

  return null;
}

export async function getWorkbenchAccess(): Promise<WorkbenchAccess | null> {
  const identity = await getWorkbenchIdentity();
  if (!identity) return null;

  if (identity.source === "preview") {
    return { identity, role: "admin", preview: true };
  }

  const { env } = await import("cloudflare:workers");
  const { ensureWorkbenchSchema, getD1 } = await import("./database");
  await ensureWorkbenchSchema();
  const database = getD1();
  let member = await database
    .prepare(
      `SELECT id, role, status FROM studio_members
       WHERE email = ?1 AND status IN ('active', 'invited')
       LIMIT 1`,
    )
    .bind(identity.email)
    .first<{ id: string; role: WorkbenchRole; status: "active" | "invited" }>();

  const bootstrapEmail = env.WORKBENCH_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!member && bootstrapEmail && identity.email === bootstrapEmail) {
    const membershipCount = await database
      .prepare("SELECT COUNT(*) AS count FROM studio_members")
      .first<{ count: number }>();
    if (Number(membershipCount?.count) === 0) {
      const memberId = crypto.randomUUID();
      const bootstrapAccess: WorkbenchAccess = {
        identity,
        role: "admin",
        preview: false,
      };
      await database.batch([
        database
          .prepare(
            `INSERT INTO studio_members (
              id, email, display_name, role, status, invited_by, last_seen_at
            ) VALUES (?1, ?2, ?3, 'admin', 'active', 'bootstrap', CURRENT_TIMESTAMP)`,
          )
          .bind(memberId, identity.email, identity.displayName),
        prepareAuditEvent(database, bootstrapAccess, {
          action: "member.bootstrap",
          entityType: "studio_member",
          entityId: memberId,
          summary: `${identity.email} claimed the first Workbench administrator membership.`,
          metadata: { email: identity.email, role: "admin", status: "active" },
        }),
      ]);
      member = { id: memberId, role: "admin", status: "active" };
    }
  }

  if (!member) return null;
  const access: WorkbenchAccess = { identity, role: member.role, preview: false };
  if (member.status === "invited") {
    await database.batch([
      database
        .prepare(
          `UPDATE studio_members
           SET status = 'active', display_name = ?1, last_seen_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?2 AND status = 'invited'`,
        )
        .bind(identity.displayName, member.id),
      prepareAuditEvent(database, access, {
        action: "member.activate",
        entityType: "studio_member",
        entityId: member.id,
        summary: `${identity.email} activated their Workbench invitation.`,
        metadata: { email: identity.email, role: member.role },
      }),
    ]);
  } else {
    await database
      .prepare(
        `UPDATE studio_members
         SET last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?1`,
      )
      .bind(member.id)
      .run();
  }
  return access;
}

export async function requireWorkbenchAccess(
  allowedRoles: WorkbenchRole[] = ["admin", "editor", "contributor", "viewer"],
): Promise<WorkbenchAccess> {
  const access = await getWorkbenchAccess();
  if (!access) throw new WorkbenchAuthError("Workbench membership required", 403);
  if (!allowedRoles.includes(access.role)) {
    throw new WorkbenchAuthError("Your Workbench role cannot perform this action", 403);
  }
  return access;
}

export class WorkbenchAuthError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}
