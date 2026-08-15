import { getWorkbenchAccess, getWorkbenchIdentity } from "@/lib/workbench/auth";
import { WorkbenchAccessScreen, WorkbenchShell } from "@/components/workbench-shell";

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const [identity, access] = await Promise.all([getWorkbenchIdentity(), getWorkbenchAccess()]);
  if (!access) return <WorkbenchAccessScreen signedIn={Boolean(identity)} />;
  const { getWorkbenchMetrics } = await import("@/lib/workbench/database");
  const metrics = await getWorkbenchMetrics();

  return (
    <WorkbenchShell access={access} active="/workbench">
      <div className="workbench-page">
        <header className="workbench-page__header">
          <div><span className="workbench-kicker">Studio overview</span><h1>Good morning.</h1></div>
          <p>The Workbench keeps the studio’s working knowledge, canon decisions, relationships, and access boundary in one place.</p>
        </header>
        <section className="metric-grid">
          <article><span>Active entries</span><strong>{String(metrics.activeEntries).padStart(2, "0")}</strong><small>Splinterheart bible</small></article>
          <article><span>Canon entries</span><strong>{String(metrics.canonEntries).padStart(2, "0")}</strong><small>Accepted working truth</small></article>
          <article><span>Relationships</span><strong>{String(metrics.relationships).padStart(2, "0")}</strong><small>Connected records</small></article>
          <article><span>Active members</span><strong>{String(metrics.activeMembers).padStart(2, "0")}</strong><small>Stored memberships</small></article>
        </section>
        <section className="workbench-cards">
          <article className="workbench-card workbench-card--wide">
            <span className="workbench-kicker">Next useful action</span>
            <h2>Start the Splinterheart bible.</h2>
            <p>Create the first location, character, faction, or terminology entry. Every save creates an attributable revision.</p>
            <a href="/workbench/wiki" className="workbench-button workbench-button--primary">Open lore bible</a>
          </article>
          <article className="workbench-card">
            <span className="workbench-kicker">Boundary</span>
            <h2>Private means private.</h2>
            <p>Lore, revisions, relationships, and membership records are never sent through public routes.</p>
          </article>
        </section>
      </div>
    </WorkbenchShell>
  );
}
