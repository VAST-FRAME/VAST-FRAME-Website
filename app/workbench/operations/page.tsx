import { WorkbenchAccessScreen, WorkbenchShell } from "@/components/workbench-shell";
import { getWorkbenchAccess, getWorkbenchIdentity } from "@/lib/workbench/auth";
import { formatWorkbenchDateTime } from "@/lib/workbench/datetime";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const [identity, access] = await Promise.all([getWorkbenchIdentity(), getWorkbenchAccess()]);
  if (!access) return <WorkbenchAccessScreen signedIn={Boolean(identity)} />;

  if (access.role !== "admin") {
    return (
      <WorkbenchShell access={access} active="/workbench/operations">
        <div className="workbench-page">
          <header className="workbench-page__header">
            <div><span className="workbench-kicker">Operations</span><h1>Administrators only.</h1></div>
            <p>Backups, access records, and the audit trail expose studio-wide information.</p>
          </header>
        </div>
      </WorkbenchShell>
    );
  }

  const { getWorkbenchAuditEvents } = await import("@/lib/workbench/operations");
  const events = await getWorkbenchAuditEvents(100);

  return (
    <WorkbenchShell access={access} active="/workbench/operations">
      <div className="workbench-page operations-page">
        <header className="workbench-page__header">
          <div><span className="workbench-kicker">Operations</span><h1>Recoverable by design.</h1></div>
          <p>Export the complete Splinterheart lore history, inspect consequential changes, and keep the Workbench understandable under pressure.</p>
        </header>

        <section className="operations-grid">
          <article className="operations-card operations-card--backup">
            <span className="workbench-kicker">Portable backup</span>
            <h2>Take the lore with you.</h2>
            <p>The download contains every entry, historical revision, and relationship in a plain, versioned JSON document. Membership data is deliberately excluded.</p>
            <a className="workbench-button workbench-button--primary" href="/api/workbench/export/lore">Download lore backup</a>
          </article>
          <article className="operations-card">
            <span className="workbench-kicker">Role boundaries</span>
            <dl className="permission-list">
              <div><dt>Admin</dt><dd>Members, backups, audit, all lore operations</dd></div>
              <div><dt>Editor</dt><dd>Lore edits, archive, restore, relationships</dd></div>
              <div><dt>Contributor</dt><dd>Lore edits and relationships</dd></div>
              <div><dt>Viewer</dt><dd>Read-only lore access</dd></div>
            </dl>
          </article>
        </section>

        <section className="audit-panel" aria-labelledby="audit-heading">
          <header><div><span className="workbench-kicker">Audit trail</span><h2 id="audit-heading">Recent consequential changes</h2></div><strong>{events.length}</strong></header>
          <div className="audit-list">
            {events.length === 0 ? <p className="audit-empty">No mutations have been recorded yet.</p> : events.map((event) => (
              <article key={event.id}>
                <span className="audit-action">{event.action.replaceAll(".", " / ")}</span>
                <div><strong>{event.summary}</strong><small>{event.actorEmail} · {event.entityType}</small></div>
                <time dateTime={event.createdAt}>{formatWorkbenchDateTime(event.createdAt)}</time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </WorkbenchShell>
  );
}
