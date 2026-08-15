import { requireWorkbenchAccess } from "@/lib/workbench/auth";
import { workbenchFailure } from "@/lib/workbench/http";

export async function GET() {
  try {
    await requireWorkbenchAccess(["admin"]);
    const { getWorkbenchAuditEvents } = await import("@/lib/workbench/operations");
    const events = await getWorkbenchAuditEvents(200);
    return Response.json(
      { events },
      { headers: { "cache-control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    return workbenchFailure(error);
  }
}
