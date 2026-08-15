import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { prepareAuditEvent } from "@/lib/workbench/audit";
import { requireWorkbenchMutation, workbenchFailure } from "@/lib/workbench/http";
import {
  workbenchMemberStatuses,
  workbenchRoles,
  type WorkbenchMember,
} from "@/lib/workbench/members";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireWorkbenchMutation(request);
    const access = await requireWorkbenchAccess(["admin"]);
    const { ensureWorkbenchSchema, getD1 } = await import("@/lib/workbench/database");
    const { id } = await context.params;
    const payload = (await request.json()) as {
      role?: WorkbenchMember["role"];
      status?: WorkbenchMember["status"];
    };

    if (!payload.role || !workbenchRoles.includes(payload.role)) {
      return Response.json({ error: "Choose a valid role." }, { status: 400 });
    }
    if (!payload.status || !workbenchMemberStatuses.includes(payload.status)) {
      return Response.json({ error: "Choose a valid membership status." }, { status: 400 });
    }

    await ensureWorkbenchSchema();
    const database = getD1();
    const target = await database
      .prepare("SELECT email, role, status FROM studio_members WHERE id = ?1")
      .bind(id)
      .first<{ email: string; role: WorkbenchMember["role"]; status: WorkbenchMember["status"] }>();
    if (!target) return Response.json({ error: "Member not found." }, { status: 404 });

    if (target.email === access.identity.email && (payload.role !== "admin" || payload.status !== "active")) {
      return Response.json({ error: "You cannot remove your own active administrator access." }, { status: 409 });
    }

    if (target.role === "admin" && target.status === "active" && (payload.role !== "admin" || payload.status !== "active")) {
      const count = await database
        .prepare("SELECT COUNT(*) AS count FROM studio_members WHERE role = 'admin' AND status = 'active'")
        .first<{ count: number }>();
      if (Number(count?.count) <= 1) {
        return Response.json({ error: "Keep at least one active administrator." }, { status: 409 });
      }
    }

    const results = await database.batch([
      database
        .prepare(
          `UPDATE studio_members
           SET role = ?1, status = ?2, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?3`,
        )
        .bind(payload.role, payload.status, id),
      prepareAuditEvent(database, access, {
        action: "member.update",
        entityType: "studio_member",
        entityId: id,
        summary: `Updated ${target.email} to ${payload.role} / ${payload.status}.`,
        metadata: {
          email: target.email,
          previousRole: target.role,
          previousStatus: target.status,
          role: payload.role,
          status: payload.status,
        },
      }),
    ]);
    if (!results[0].meta.changes) {
      return Response.json({ error: "Member not found." }, { status: 404 });
    }
    return Response.json({ role: payload.role, status: payload.status });
  } catch (error) {
    return workbenchFailure(error);
  }
}
