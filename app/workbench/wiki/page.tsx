import { getWorkbenchAccess, getWorkbenchIdentity } from "@/lib/workbench/auth";
import { WorkbenchAccessScreen, WorkbenchShell } from "@/components/workbench-shell";
import { LoreWorkspace } from "@/components/lore-workspace";

export const dynamic = "force-dynamic";

export default async function WikiPage() {
  const [identity, access] = await Promise.all([getWorkbenchIdentity(), getWorkbenchAccess()]);
  if (!access) return <WorkbenchAccessScreen signedIn={Boolean(identity)} />;

  return (
    <WorkbenchShell access={access} active="/workbench/wiki">
      <LoreWorkspace role={access.role} />
    </WorkbenchShell>
  );
}
