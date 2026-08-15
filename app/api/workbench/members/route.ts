import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";
import {
  workbenchRoles,
  type WorkbenchMember,
} from "@/lib/workbench/members";

type MemberRow = {
  id: string;
  email: string;
  display_name: string;
  role: WorkbenchMember["role"];
  status: WorkbenchMember["status"];
  invited_by: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapMemberRow(row: MemberRow): WorkbenchMember {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  try {
    await requireWorkbenchAccess(["admin"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    await ensureWorkbenchSchema();
    const result = await getD1()
      .prepare(
        `SELECT id, email, display_name, role, status, invited_by, last_seen_at,
                created_at, updated_at
         FROM studio_members
         ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'invited' THEN 1 ELSE 2 END,
                  display_name ASC, email ASC`,
      )
      .all<MemberRow>();
    return Response.json({ members: result.results.map(mapMemberRow) });
  } catch (error) {
    return workbenchFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const payload = (await request.json()) as {
      email?: string;
      displayName?: string;
      role?: WorkbenchMember["role"];
    };
    const email = payload.email?.trim().toLowerCase() ?? "";
    const displayName = payload.displayName?.trim() || email.split("@")[0] || "Invited member";
    const role = payload.role ?? "viewer";

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (displayName.length > 120 || !workbenchRoles.includes(role)) {
      return Response.json({ error: "Check the member name and role." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const existing = await database
      .prepare("SELECT id FROM studio_members WHERE email = ?1")
      .bind(email)
      .first<{ id: string }>();
    if (existing) {
      return Response.json({ error: "That email already has a Workbench membership." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    try {
      await database.batch([
        database
          .prepare(
            `INSERT INTO studio_members (
              id, email, display_name, role, status, invited_by
            ) VALUES (?1, ?2, ?3, ?4, 'invited', ?5)`,
          )
          .bind(id, email, displayName, role, access.identity.email),
        prepareAuditEvent(database, access, {
          action: "member.invite",
          entityType: "studio_member",
          entityId: id,
          summary: `Invited ${email} as ${role}.`,
          metadata: { email, displayName, role, status: "invited" },
        }),
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        return Response.json({ error: "That email already has a Workbench membership." }, { status: 409 });
      }
      throw error;
    }

    const row = await database
      .prepare(
        `SELECT id, email, display_name, role, status, invited_by, last_seen_at,
                created_at, updated_at
         FROM studio_members WHERE id = ?1`,
      )
      .bind(id)
      .first<MemberRow>();
    return Response.json({ member: row ? mapMemberRow(row) : null }, { status: 201 });
  } catch (error) {
    return workbenchFailure(error);
  }
}
