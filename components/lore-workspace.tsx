"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkbenchRole } from "@/lib/workbench/auth";
import { formatWorkbenchDateTime } from "@/lib/workbench/datetime";
import { workbenchMutationHeaders } from "@/lib/workbench/request";
import {
  loreCanonStatuses,
  loreEntryTypes,
  type LoreCanonStatus,
  type LoreEntry,
  type LoreRelationship,
  type LoreRevision,
} from "@/lib/workbench/lore";

type EditorState = {
  id?: string;
  expectedRevision?: number;
  title: string;
  entryType: string;
  projectKey: string;
  summary: string;
  body: string;
  canonStatus: LoreCanonStatus;
  recordStatus: LoreEntry["recordStatus"];
};

const emptyEditor: EditorState = {
  title: "",
  entryType: "Character",
  projectKey: "splinterheart",
  summary: "",
  body: "",
  canonStatus: "idea",
  recordStatus: "active",
};

export function LoreWorkspace({ role }: { role: WorkbenchRole }) {
  const [entries, setEntries] = useState<LoreEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [canonFilter, setCanonFilter] = useState("all");
  const [recordFilter, setRecordFilter] = useState<"active" | "archived" | "all">("active");
  const [revisions, setRevisions] = useState<LoreRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<LoreRevision | null>(null);
  const [relationships, setRelationships] = useState<LoreRelationship[]>([]);
  const [targetEntryId, setTargetEntryId] = useState("");
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const canWrite = role !== "viewer";
  const canArchive = role === "admin" || role === "editor";

  const loadEntries = useCallback(async () => {
    const response = await fetch("/api/workbench/lore?scope=all", { cache: "no-store" });
    const payload = (await response.json()) as { entries?: LoreEntry[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Could not load lore entries.");
    setEntries(payload.entries ?? []);
    setLoading(false);
  }, []);

  const loadEntryContext = useCallback(async (id: string) => {
    const [revisionResponse, relationshipResponse] = await Promise.all([
      fetch(`/api/workbench/lore/${id}/revisions`, { cache: "no-store" }),
      fetch(`/api/workbench/lore/${id}/relationships`, { cache: "no-store" }),
    ]);
    const revisionPayload = (await revisionResponse.json()) as { revisions?: LoreRevision[]; error?: string };
    const relationshipPayload = (await relationshipResponse.json()) as { relationships?: LoreRelationship[]; error?: string };
    if (!revisionResponse.ok) throw new Error(revisionPayload.error ?? "Could not load revision history.");
    if (!relationshipResponse.ok) throw new Error(relationshipPayload.error ?? "Could not load relationships.");
    setRevisions(revisionPayload.revisions ?? []);
    setSelectedRevision(null);
    setRelationships(relationshipPayload.relationships ?? []);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadEntries().catch((error) => {
        setLoading(false);
        setNotice(error instanceof Error ? error.message : "Could not load lore entries.");
      });
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesRecord = recordFilter === "all" || entry.recordStatus === recordFilter;
      const matchesType = typeFilter === "all" || entry.entryType === typeFilter;
      const matchesCanon = canonFilter === "all" || entry.canonStatus === canonFilter;
      const matchesQuery = !needle || [entry.title, entry.entryType, entry.summary, entry.canonStatus]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      return matchesRecord && matchesType && matchesCanon && matchesQuery;
    });
  }, [canonFilter, entries, query, recordFilter, typeFilter]);

  const relationshipTargets = entries.filter(
    (entry) => entry.recordStatus === "active" && entry.id !== editor.id,
  );

  function editEntry(entry: LoreEntry) {
    setSelectedId(entry.id);
    setEditor({
      id: entry.id,
      expectedRevision: entry.revision,
      title: entry.title,
      entryType: entry.entryType,
      projectKey: entry.projectKey,
      summary: entry.summary,
      body: entry.body,
      canonStatus: entry.canonStatus,
      recordStatus: entry.recordStatus,
    });
    setRevisions([]);
    setSelectedRevision(null);
    setRelationships([]);
    setNotice(null);
    void loadEntryContext(entry.id).catch((error) => setNotice(error instanceof Error ? error.message : "Could not load entry details."));
  }

  function newEntry() {
    setSelectedId(null);
    setEditor(emptyEditor);
    setRevisions([]);
    setSelectedRevision(null);
    setRelationships([]);
    setNotice(null);
  }

  async function saveEntry() {
    if (!canWrite) return;
    if (!editor.title.trim()) {
      setNotice("Give this entry a title before saving.");
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(editor.id ? `/api/workbench/lore/${editor.id}` : "/api/workbench/lore", {
        method: editor.id ? "PUT" : "POST",
        headers: workbenchMutationHeaders,
        body: JSON.stringify(editor),
      });
      const payload = (await response.json()) as {
        entry?: LoreEntry;
        revision?: number;
        updatedAt?: string;
        updatedBy?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "Could not save entry.");

      let entryId = editor.id;
      if (payload.entry) {
        entryId = payload.entry.id;
        setSelectedId(payload.entry.id);
        setEditor({ ...editor, id: payload.entry.id, expectedRevision: payload.entry.revision, recordStatus: payload.entry.recordStatus });
      } else if (payload.revision) {
        setEditor((current) => ({ ...current, expectedRevision: payload.revision }));
      }
      await loadEntries();
      if (entryId) await loadEntryContext(entryId);
      setNotice(`Saved revision ${payload.entry?.revision ?? payload.revision}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save entry.");
    } finally {
      setSaving(false);
    }
  }

  async function changeRecordStatus() {
    if (!editor.id || !editor.expectedRevision || !canArchive) return;
    const nextStatus = editor.recordStatus === "active" ? "archived" : "active";
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/workbench/lore/${editor.id}`, {
        method: "PATCH",
        headers: workbenchMutationHeaders,
        body: JSON.stringify({ expectedRevision: editor.expectedRevision, recordStatus: nextStatus }),
      });
      const payload = (await response.json()) as { revision?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not change record status.");
      setEditor((current) => ({ ...current, expectedRevision: payload.revision, recordStatus: nextStatus }));
      await Promise.all([loadEntries(), loadEntryContext(editor.id)]);
      setNotice(nextStatus === "archived" ? "Entry archived with a new revision." : "Entry restored with a new revision.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not change record status.");
    } finally {
      setSaving(false);
    }
  }

  async function addRelationship() {
    if (!editor.id || !targetEntryId || !relationshipLabel.trim() || !canWrite) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/workbench/lore/${editor.id}/relationships`, {
        method: "POST",
        headers: workbenchMutationHeaders,
        body: JSON.stringify({ targetEntryId, relationship: relationshipLabel }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not add relationship.");
      setTargetEntryId("");
      setRelationshipLabel("");
      await loadEntryContext(editor.id);
      setNotice("Relationship added.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not add relationship.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRelationship(linkId: string) {
    if (!editor.id || !canWrite) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/workbench/lore/${editor.id}/relationships/${linkId}`, {
        method: "DELETE",
        headers: workbenchMutationHeaders,
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not remove relationship.");
      }
      await loadEntryContext(editor.id);
      setNotice("Relationship removed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not remove relationship.");
    } finally {
      setSaving(false);
    }
  }

  async function restoreRevision(revision: LoreRevision) {
    if (!editor.id || !editor.expectedRevision || !canArchive || editor.recordStatus !== "active") return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/workbench/lore/${editor.id}/revisions/${revision.id}/restore`,
        {
          method: "POST",
          headers: workbenchMutationHeaders,
          body: JSON.stringify({ expectedRevision: editor.expectedRevision }),
        },
      );
      const payload = (await response.json()) as {
        entry?: Pick<
          LoreEntry,
          "title" | "entryType" | "summary" | "body" | "canonStatus" | "recordStatus" | "revision" | "updatedBy"
        >;
        restoredFromRevision?: number;
        error?: string;
      };
      if (!response.ok || !payload.entry) {
        throw new Error(payload.error ?? "Could not restore that revision.");
      }

      setEditor((current) => ({
        ...current,
        title: payload.entry!.title,
        entryType: payload.entry!.entryType,
        summary: payload.entry!.summary,
        body: payload.entry!.body,
        canonStatus: payload.entry!.canonStatus,
        recordStatus: payload.entry!.recordStatus,
        expectedRevision: payload.entry!.revision,
      }));
      await Promise.all([loadEntries(), loadEntryContext(editor.id)]);
      setNotice(`Restored revision ${payload.restoredFromRevision} as revision ${payload.entry.revision}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not restore that revision.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lore-workspace">
      <section className="lore-browser" aria-label="Lore entries">
        <div className="lore-browser__toolbar">
          <label>
            <span className="sr-only">Search lore</span>
            <input type="search" placeholder="Search the bible…" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {canWrite ? <button type="button" onClick={newEntry}>New entry</button> : null}
        </div>
        <div className="lore-filters">
          <label><span>Records</span><select value={recordFilter} onChange={(event) => setRecordFilter(event.target.value as typeof recordFilter)}><option value="active">Active</option><option value="archived">Archived</option><option value="all">All</option></select></label>
          <label><span>Type</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All types</option>{loreEntryTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label><span>Canon</span><select value={canonFilter} onChange={(event) => setCanonFilter(event.target.value)}><option value="all">All states</option>{loreCanonStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        </div>
        <div className="lore-browser__meta"><span>{loading ? "Loading" : `${filteredEntries.length} entries`}</span><span>Splinterheart</span></div>
        <div className="lore-entry-list">
          {!loading && entries.length === 0 ? <button className="lore-empty" type="button" onClick={newEntry}><strong>The bible is empty.</strong><span>Create the first entry →</span></button> : null}
          {!loading && entries.length > 0 && filteredEntries.length === 0 ? <p className="lore-no-results">No entries match these filters.</p> : null}
          {filteredEntries.map((entry) => (
            <button type="button" className={selectedId === entry.id ? "lore-entry is-selected" : "lore-entry"} key={entry.id} onClick={() => editEntry(entry)}>
              <span className={`canon-dot canon-dot--${entry.canonStatus}`} />
              <span><strong>{entry.title}</strong><small>{entry.entryType} · r{entry.revision}</small></span>
              <em>{entry.recordStatus === "archived" ? "archived" : entry.canonStatus}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="lore-editor" aria-label="Lore editor">
        <header className="lore-editor__header">
          <div><span className="workbench-kicker">{editor.id ? `Revision ${editor.expectedRevision}` : "New record"}</span><strong>{editor.id ? "Editing lore entry" : "Create lore entry"}</strong></div>
          <div className="lore-editor__actions">
            {editor.id && canArchive ? <button type="button" className="workbench-button" onClick={() => void changeRecordStatus()} disabled={saving}>{editor.recordStatus === "active" ? "Archive" : "Restore"}</button> : null}
            {canWrite ? <button type="button" className="workbench-button workbench-button--primary" onClick={() => void saveEntry()} disabled={saving || editor.recordStatus === "archived"}>{saving ? "Working…" : "Save revision"}</button> : null}
          </div>
        </header>
        <div className="lore-editor__fields">
          <label className="field field--title"><span>Title</span><input value={editor.title} placeholder="Untitled entry" disabled={!canWrite || editor.recordStatus === "archived"} onChange={(event) => setEditor({ ...editor, title: event.target.value })} /></label>
          <div className="field-row">
            <label className="field"><span>Type</span><select value={editor.entryType} disabled={!canWrite || editor.recordStatus === "archived"} onChange={(event) => setEditor({ ...editor, entryType: event.target.value })}>{loreEntryTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="field"><span>Canon state</span><select value={editor.canonStatus} disabled={!canWrite || editor.recordStatus === "archived"} onChange={(event) => setEditor({ ...editor, canonStatus: event.target.value as LoreCanonStatus })}>{loreCanonStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          </div>
          <label className="field"><span>Summary</span><textarea rows={3} value={editor.summary} disabled={!canWrite || editor.recordStatus === "archived"} placeholder="The short version. What should another developer know first?" onChange={(event) => setEditor({ ...editor, summary: event.target.value })} /></label>
          <label className="field field--body"><span>Entry</span><textarea rows={15} value={editor.body} disabled={!canWrite || editor.recordStatus === "archived"} placeholder="Write the working truth here. Markdown conventions are supported by the content model." onChange={(event) => setEditor({ ...editor, body: event.target.value })} /></label>

          {editor.id ? (
            <div className="editor-context-grid">
              <section className="history-panel">
                <header><span>Revision history</span><strong>{revisions.length}</strong></header>
                <div className="history-list">
                  {revisions.length === 0 ? <p>Revision history is loading.</p> : revisions.map((revision) => (
                    <button
                      type="button"
                      className={selectedRevision?.id === revision.id ? "history-row is-selected" : "history-row"}
                      key={revision.id}
                      onClick={() => setSelectedRevision(revision)}
                      aria-pressed={selectedRevision?.id === revision.id}
                    >
                      <span>r{revision.revision}</span>
                      <span><strong>{revision.changeKind.replaceAll("_", " ")}</strong><small>{revision.authoredBy}<br />{formatWorkbenchDateTime(revision.createdAt)}</small></span>
                      <em>{revision.canonStatus}</em>
                    </button>
                  ))}
                </div>
                {selectedRevision ? (
                  <article className="revision-preview" aria-live="polite">
                    <header>
                      <div><span>Snapshot r{selectedRevision.revision}</span><strong>{selectedRevision.title}</strong></div>
                      <button type="button" aria-label="Close revision preview" onClick={() => setSelectedRevision(null)}>×</button>
                    </header>
                    <p>{selectedRevision.summary || "No summary in this revision."}</p>
                    <pre>{selectedRevision.body || "No body text in this revision."}</pre>
                    <footer>
                      <span>{selectedRevision.entryType} · {selectedRevision.canonStatus}</span>
                      {canArchive && editor.recordStatus === "active" && selectedRevision.revision !== editor.expectedRevision ? (
                        <button type="button" className="workbench-button" disabled={saving} onClick={() => void restoreRevision(selectedRevision)}>
                          Restore this snapshot
                        </button>
                      ) : null}
                    </footer>
                  </article>
                ) : null}
              </section>
              <section className="relationship-panel">
                <header><span>Relationships</span><strong>{relationships.length}</strong></header>
                {canWrite && editor.recordStatus === "active" ? <div className="relationship-form"><select aria-label="Related entry" value={targetEntryId} onChange={(event) => setTargetEntryId(event.target.value)}><option value="">Choose entry</option>{relationshipTargets.map((entry) => <option value={entry.id} key={entry.id}>{entry.title}</option>)}</select><input aria-label="Relationship" value={relationshipLabel} onChange={(event) => setRelationshipLabel(event.target.value)} placeholder="e.g. located within" /><button type="button" onClick={() => void addRelationship()} disabled={saving}>Add</button></div> : null}
                <div className="relationship-list">{relationships.length === 0 ? <p>No connections yet.</p> : relationships.map((relationship) => <article key={relationship.id}><span>{relationship.direction === "outgoing" ? "→" : "←"}</span><div><strong>{relationship.relationship}</strong><small>{relationship.entryTitle} · {relationship.entryType}</small></div>{canWrite ? <button type="button" aria-label={`Remove relationship with ${relationship.entryTitle}`} onClick={() => void removeRelationship(relationship.id)}>×</button> : null}</article>)}</div>
              </section>
            </div>
          ) : <div className="editor-dock"><div><span>Revision history</span><strong>Begins at first save</strong></div><div><span>Relationships</span><strong>Available after first save</strong></div></div>}
          {notice ? <p className="editor-notice" role="status">{notice}</p> : null}
        </div>
      </section>
    </div>
  );
}
