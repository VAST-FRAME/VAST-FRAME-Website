"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KnowledgeEntry, KnowledgeEntryType, KnowledgeRelationship, KnowledgeRevision, KnowledgeSpaceKey } from "@/lib/knowledge/model";
import { workbenchMutationHeaders } from "@/lib/workbench/request";
import type { WorkbenchRole } from "@/lib/workbench/auth";

const products = ["threshold", "atrium", "eclipse", "causality"];
const entryTypes: KnowledgeEntryType[] = ["overview", "concept", "guide", "reference", "lore"];

type Editor = {
  id: string | null; title: string; summary: string; body: string; productKey: string; entryType: KnowledgeEntryType;
  versionLabel: string; navOrder: number; parentId: string; expectedRevision: number; publicationStatus: KnowledgeEntry["publicationStatus"];
};

function emptyEditor(space: KnowledgeSpaceKey): Editor {
  return { id: null, title: "", summary: "", body: "", productKey: space === "sdk-docs" ? "threshold" : "splinterheart", entryType: space === "sdk-docs" ? "guide" : "lore", versionLabel: space === "sdk-docs" ? "0.x / development" : "internal", navOrder: 100, parentId: "", expectedRevision: 0, publicationStatus: "draft" };
}

export function KnowledgeWorkspace({ role }: { role: WorkbenchRole }) {
  const [space, setSpace] = useState<KnowledgeSpaceKey>("splinterheart-lore");
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [editor, setEditor] = useState<Editor>(() => emptyEditor("splinterheart-lore"));
  const [revisions, setRevisions] = useState<KnowledgeRevision[]>([]);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  const [relationshipTarget, setRelationshipTarget] = useState("");
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canWrite = role !== "viewer";
  const canPublish = role === "admin" || role === "editor";

  const loadEntries = useCallback(async (nextSpace: KnowledgeSpaceKey) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workbench/knowledge?space=${nextSpace}`, { cache: "no-store" });
      const payload = await response.json() as { entries?: KnowledgeEntry[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not load knowledge entries.");
      setEntries(payload.entries ?? []);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load knowledge entries."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void loadEntries(space); }, 0);
    return () => window.clearTimeout(task);
  }, [loadEntries, space]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return needle ? entries.filter((entry) => `${entry.title} ${entry.summary} ${entry.productKey}`.toLowerCase().includes(needle)) : entries;
  }, [entries, query]);

  async function selectEntry(entry: KnowledgeEntry) {
    setEditor({ id: entry.id, title: entry.title, summary: entry.summary, body: entry.body, productKey: entry.productKey ?? "", entryType: entry.entryType, versionLabel: entry.versionLabel, navOrder: entry.navOrder, parentId: entry.parentSlug ?? "", expectedRevision: entry.revision, publicationStatus: entry.publicationStatus });
    const [revisionResponse, relationshipResponse] = await Promise.all([
      fetch(`/api/workbench/knowledge/${entry.id}/revisions`, { cache: "no-store" }),
      fetch(`/api/workbench/knowledge/${entry.id}/relationships`, { cache: "no-store" }),
    ]);
    const revisionPayload = await revisionResponse.json() as { revisions?: KnowledgeRevision[] };
    const relationshipPayload = await relationshipResponse.json() as { relationships?: KnowledgeRelationship[] };
    setRevisions(revisionPayload.revisions ?? []);
    setRelationships(relationshipPayload.relationships ?? []);
  }

  async function saveEntry() {
    if (!canWrite) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch(editor.id ? `/api/workbench/knowledge/${editor.id}` : "/api/workbench/knowledge", {
        method: editor.id ? "PATCH" : "POST", headers: workbenchMutationHeaders,
        body: JSON.stringify({ spaceKey: space, title: editor.title, summary: editor.summary, body: editor.body, productKey: editor.productKey, entryType: editor.entryType, versionLabel: editor.versionLabel, navOrder: editor.navOrder, parentSlug: editor.parentId || null, expectedRevision: editor.expectedRevision }),
      });
      const payload = await response.json() as { entry?: KnowledgeEntry; error?: string };
      if (!response.ok || !payload.entry) throw new Error(payload.error ?? "Could not save the entry.");
      await loadEntries(space); await selectEntry(payload.entry); setNotice(`Revision ${payload.entry.revision} saved as ${payload.entry.publicationStatus}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save the entry."); }
    finally { setSaving(false); }
  }

  async function publishEntry() {
    if (!editor.id || !canPublish || space !== "sdk-docs") return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch(`/api/workbench/knowledge/${editor.id}/publish`, { method: "POST", headers: workbenchMutationHeaders });
      const payload = await response.json() as { published?: boolean; revision?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not publish the entry.");
      await loadEntries(space); const refreshed = entries.find((entry) => entry.id === editor.id); if (refreshed) await selectEntry(refreshed);
      setEditor((current) => ({ ...current, publicationStatus: "published", expectedRevision: payload.revision ?? current.expectedRevision }));
      setNotice(`Published revision ${payload.revision}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not publish the entry."); }
    finally { setSaving(false); }
  }

  async function setEditorialStatus(publicationStatus: "draft" | "review" | "archived") {
    if (!editor.id) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch(`/api/workbench/knowledge/${editor.id}/status`, { method: "PATCH", headers: workbenchMutationHeaders, body: JSON.stringify({ publicationStatus }) });
      const payload = await response.json() as { publicationStatus?: KnowledgeEntry["publicationStatus"]; revision?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not change editorial state.");
      setEditor((current) => ({ ...current, publicationStatus: payload.publicationStatus ?? publicationStatus, expectedRevision: payload.revision ?? current.expectedRevision }));
      await loadEntries(space); setNotice(`Entry moved to ${publicationStatus}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not change editorial state."); }
    finally { setSaving(false); }
  }

  async function addRelationship() {
    if (!editor.id || !relationshipTarget || !relationshipLabel.trim()) return;
    const response = await fetch(`/api/workbench/knowledge/${editor.id}/relationships`, { method: "POST", headers: workbenchMutationHeaders, body: JSON.stringify({ targetEntryId: relationshipTarget, relationship: relationshipLabel }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setNotice(payload.error ?? "Could not add relationship."); return; }
    setRelationshipTarget(""); setRelationshipLabel("");
    const selected = entries.find((entry) => entry.id === editor.id); if (selected) await selectEntry({ ...selected, ...editor, revision: editor.expectedRevision } as KnowledgeEntry);
  }

  async function removeRelationship(linkId: string) {
    if (!editor.id) return;
    const response = await fetch(`/api/workbench/knowledge/${editor.id}/relationships/${linkId}`, { method: "DELETE", headers: workbenchMutationHeaders });
    if (!response.ok) { const payload = await response.json() as { error?: string }; setNotice(payload.error ?? "Could not remove relationship."); return; }
    setRelationships((current) => current.filter((relationship) => relationship.id !== linkId));
  }

  async function restoreRevision(revision: KnowledgeRevision) {
    if (!editor.id || !canPublish) return;
    const response = await fetch(`/api/workbench/knowledge/${editor.id}/revisions/${revision.revisionId}/restore`, { method: "POST", headers: workbenchMutationHeaders });
    const payload = await response.json() as { revision?: number; error?: string };
    if (!response.ok) { setNotice(payload.error ?? "Could not restore revision."); return; }
    setEditor({ id: editor.id, title: revision.title, summary: revision.summary, body: revision.body, productKey: revision.productKey ?? "", entryType: revision.entryType, versionLabel: revision.versionLabel, navOrder: revision.navOrder, parentId: revision.parentSlug ?? "", expectedRevision: payload.revision ?? editor.expectedRevision, publicationStatus: "draft" });
    await loadEntries(space); setNotice(`Revision ${revision.revision} restored as a new draft.`);
  }

  function changeSpace(next: KnowledgeSpaceKey) { setSpace(next); setEditor(emptyEditor(next)); setRevisions([]); setRelationships([]); setNotice(""); }

  return (
    <div className="knowledge-workspace">
      <aside className="knowledge-browser">
        <header><div><span className="workbench-kicker">Knowledge space</span><strong>{space === "sdk-docs" ? "SDK documentation" : "Splinterheart lore"}</strong></div>{canWrite ? <button type="button" onClick={() => { setEditor(emptyEditor(space)); setRevisions([]); }}>New entry</button> : null}</header>
        <div className="knowledge-space-tabs"><button className={space === "splinterheart-lore" ? "is-active" : ""} type="button" onClick={() => changeSpace("splinterheart-lore")}>Private lore</button><button className={space === "sdk-docs" ? "is-active" : ""} type="button" onClick={() => changeSpace("sdk-docs")}>Public docs</button></div>
        <label className="knowledge-search"><span className="sr-only">Search current knowledge space</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this space…" /></label>
        <div className="knowledge-browser__meta"><span>{loading ? "Loading" : `${filtered.length} entries`}</span><span>{space === "sdk-docs" ? "Published is public" : "Always private"}</span></div>
        <div className="knowledge-entry-list">{filtered.map((entry) => <button type="button" className={editor.id === entry.id ? "is-active" : ""} onClick={() => void selectEntry(entry)} key={entry.id}><span className={`knowledge-state knowledge-state--${entry.publicationStatus}`} /><span><strong>{entry.title}</strong><small>{entry.productKey} · {entry.entryType}</small></span><em>r{entry.revision}</em></button>)}{!loading && filtered.length === 0 ? <p>No entries in this view.</p> : null}</div>
      </aside>
      <section className="knowledge-editor">
        <header><div><span className="workbench-kicker">{editor.id ? `Revision ${editor.expectedRevision}` : "New record"}</span><strong>{editor.publicationStatus}</strong></div><div>{editor.id && canWrite && editor.publicationStatus === "draft" ? <button type="button" onClick={() => void setEditorialStatus("review")} disabled={saving}>Submit review</button> : null}{editor.id && canPublish && editor.publicationStatus !== "archived" ? <button type="button" onClick={() => void setEditorialStatus("archived")} disabled={saving}>Archive</button> : null}{editor.id && canPublish && editor.publicationStatus === "archived" ? <button type="button" onClick={() => void setEditorialStatus("draft")} disabled={saving}>Restore draft</button> : null}{space === "sdk-docs" && editor.id && canPublish ? <button type="button" onClick={() => void publishEntry()} disabled={saving || editor.publicationStatus === "published" || editor.publicationStatus === "archived"}>Publish</button> : null}<button className="workbench-button--primary" type="button" onClick={() => void saveEntry()} disabled={!canWrite || saving || editor.publicationStatus === "archived"}>{saving ? "Working…" : "Save revision"}</button></div></header>
        <div className="knowledge-editor__body">
          <div className="knowledge-editor__context"><label><span>Product</span>{space === "sdk-docs" ? <select value={editor.productKey} onChange={(event) => setEditor({ ...editor, productKey: event.target.value })}>{products.map((product) => <option key={product}>{product}</option>)}</select> : <input value={editor.productKey} onChange={(event) => setEditor({ ...editor, productKey: event.target.value })} />}</label><label><span>Type</span><select value={editor.entryType} onChange={(event) => setEditor({ ...editor, entryType: event.target.value as KnowledgeEntryType })}>{entryTypes.filter((type) => space === "sdk-docs" ? type !== "lore" : type === "lore").map((type) => <option key={type}>{type}</option>)}</select></label><label><span>Parent</span><select value={editor.parentId} onChange={(event) => setEditor({ ...editor, parentId: event.target.value })}><option value="">Top level</option>{entries.filter((entry) => entry.id !== editor.id && (!editor.productKey || entry.productKey === editor.productKey)).map((entry) => <option value={entry.id} key={entry.id}>{entry.title}</option>)}</select></label><label><span>Version</span><input value={editor.versionLabel} onChange={(event) => setEditor({ ...editor, versionLabel: event.target.value })} /></label><label><span>Order</span><input type="number" value={editor.navOrder} onChange={(event) => setEditor({ ...editor, navOrder: Number(event.target.value) })} /></label></div>
          <label className="field"><span>Title</span><input value={editor.title} onChange={(event) => setEditor({ ...editor, title: event.target.value })} disabled={!canWrite} /></label>
          <label className="field"><span>Summary</span><textarea rows={3} value={editor.summary} onChange={(event) => setEditor({ ...editor, summary: event.target.value })} disabled={!canWrite} /></label>
          <label className="field"><span>Markdown body</span><textarea className="knowledge-body-input" rows={24} value={editor.body} onChange={(event) => setEditor({ ...editor, body: event.target.value })} disabled={!canWrite} /></label>
          {notice ? <p className="workbench-notice" role="status">{notice}</p> : null}
          {editor.id ? <div className="knowledge-lower-grid"><section className="knowledge-history"><header><span className="workbench-kicker">Revision history</span><strong>{revisions.length} recorded states</strong></header>{revisions.map((revision) => <div key={revision.revisionId}><span>r{revision.revision}</span><strong>{revision.changeKind.replaceAll("_", " ")}</strong><small>{revision.authoredBy}<br />{new Date(revision.createdAt).toLocaleString()}</small>{canPublish && revision.revision !== editor.expectedRevision ? <button type="button" onClick={() => void restoreRevision(revision)}>Restore as draft</button> : null}</div>)}</section><section className="knowledge-relationships"><header><span className="workbench-kicker">Relationships</span><strong>{relationships.length} connections</strong></header>{canWrite ? <div className="knowledge-relationship-form"><select aria-label="Related entry" value={relationshipTarget} onChange={(event) => setRelationshipTarget(event.target.value)}><option value="">Choose entry</option>{entries.filter((entry) => entry.id !== editor.id).map((entry) => <option value={entry.id} key={entry.id}>{entry.title}</option>)}</select><input aria-label="Relationship label" value={relationshipLabel} onChange={(event) => setRelationshipLabel(event.target.value)} placeholder="e.g. explains" /><button type="button" onClick={() => void addRelationship()}>Add</button></div> : null}{relationships.map((relationship) => <div className="knowledge-relationship" key={relationship.id}><span>{relationship.direction === "outgoing" ? "→" : "←"}</span><p><strong>{relationship.relationship}</strong><small>{relationship.entryTitle} · {relationship.entryType}</small></p>{canWrite ? <button type="button" aria-label={`Remove relationship with ${relationship.entryTitle}`} onClick={() => void removeRelationship(relationship.id)}>×</button> : null}</div>)}</section></div> : null}
        </div>
      </section>
    </div>
  );
}
