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
          <p>The Workbench keeps private studio knowledge and public SDK documentation in one editorial system without weakening the boundary between them.</p>
        </header>
        <section className="metric-grid">
          <article><span>Private entries</span><strong>{String(metrics.privateEntries).padStart(2, "0")}</strong><small>Splinterheart knowledge</small></article>
          <article><span>Published docs</span><strong>{String(metrics.publishedDocs).padStart(2, "0")}</strong><small>Public SDK articles</small></article>
          <article><span>Documentation drafts</span><strong>{String(metrics.docDrafts).padStart(2, "0")}</strong><small>Private editorial work</small></article>
          <article><span>Active members</span><strong>{String(metrics.activeMembers).padStart(2, "0")}</strong><small>Stored memberships</small></article>
        </section>
        <section className="workbench-cards">
          <article className="workbench-card workbench-card--wide">
            <span className="workbench-kicker">Next useful action</span>
            <h2>Shape the shared knowledge base.</h2>
            <p>Write private Splinterheart records or prepare the next public SDK article. Every save creates an attributable revision; publication remains deliberate.</p>
            <a href="/workbench/wiki" className="workbench-button workbench-button--primary">Open knowledge editor</a>
          </article>
          <article className="workbench-card">
            <span className="workbench-kicker">Boundary</span>
            <h2>Private means private.</h2>
            <p>Only a published revision in the public documentation space can cross the boundary. Lore, drafts, reviews, and membership data stay private.</p>
          </article>
        </section>
      </div>
    </WorkbenchShell>
  );
}
