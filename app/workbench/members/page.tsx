import { MembersWorkspace } from "@/components/members-workspace";
import { WorkbenchAccessScreen, WorkbenchShell } from "@/components/workbench-shell";
import { getWorkbenchAccess, getWorkbenchIdentity } from "@/lib/workbench/auth";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [identity, access] = await Promise.all([getWorkbenchIdentity(), getWorkbenchAccess()]);
  if (!access) return <WorkbenchAccessScreen signedIn={Boolean(identity)} />;

  if (access.role !== "admin") {
    return (
      <WorkbenchShell access={access} active="/workbench/members">
        <div className="workbench-page">
          <header className="workbench-page__header">
            <div><span className="workbench-kicker">Membership</span><h1>Administrators only.</h1></div>
            <p>Your role can use the lore bible, but it cannot invite people or alter studio access.</p>
          </header>
        </div>
      </WorkbenchShell>
    );
  }

  return (
    <WorkbenchShell access={access} active="/workbench/members">
      <div className="workbench-page">
        <header className="workbench-page__header">
          <div><span className="workbench-kicker">Membership</span><h1>People with keys.</h1></div>
          <p>Invite collaborators by email, choose the smallest useful role, and disable access without tying the studio to a GitHub organization.</p>
        </header>
        <MembersWorkspace />
      </div>
    </WorkbenchShell>
  );
}
