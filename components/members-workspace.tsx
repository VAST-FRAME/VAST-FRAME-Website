"use client";

import { useCallback, useEffect, useState } from "react";
import { formatWorkbenchDate } from "@/lib/workbench/datetime";
import {
  workbenchMemberStatuses,
  workbenchRoles,
  type WorkbenchMember,
} from "@/lib/workbench/members";
import { workbenchMutationHeaders } from "@/lib/workbench/request";

export function MembersWorkspace() {
  const [members, setMembers] = useState<WorkbenchMember[]>([]);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<WorkbenchMember["role"]>("viewer");
  const [notice, setNotice] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const loadMembers = useCallback(async () => {
    const response = await fetch("/api/workbench/members", { cache: "no-store" });
    const payload = (await response.json()) as { members?: WorkbenchMember[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Could not load members.");
    setMembers(payload.members ?? []);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadMembers().catch((error) => setNotice(error instanceof Error ? error.message : "Could not load members."));
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadMembers]);

  async function inviteMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setNotice(null);
    try {
      const response = await fetch("/api/workbench/members", {
        method: "POST",
        headers: workbenchMutationHeaders,
        body: JSON.stringify({ email, displayName, role }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not create invitation.");
      setEmail("");
      setDisplayName("");
      setRole("viewer");
      await loadMembers();
      setNotice("Invitation created. Access activates when that verified email signs in.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create invitation.");
    } finally {
      setWorking(false);
    }
  }

  async function updateMember(
    member: WorkbenchMember,
    next: Pick<WorkbenchMember, "role" | "status">,
  ) {
    setWorking(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/workbench/members/${member.id}`, {
        method: "PATCH",
        headers: workbenchMutationHeaders,
        body: JSON.stringify(next),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not update member.");
      await loadMembers();
      setNotice(`Updated ${member.email}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update member.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="members-workspace">
      <form className="invite-panel" onSubmit={(event) => void inviteMember(event)}>
        <div>
          <span className="workbench-kicker">Invite by verified email</span>
          <h2>Add a collaborator.</h2>
          <p>Sign-in proves identity. This invitation decides whether that identity belongs inside VASTFRAME.</p>
        </div>
        <label className="field">
          <span>Email</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="collaborator@example.com" />
        </label>
        <label className="field">
          <span>Display name</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Optional until first sign-in" />
        </label>
        <label className="field">
          <span>Initial role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as WorkbenchMember["role"])}>
            {workbenchRoles.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <button className="workbench-button workbench-button--primary" type="submit" disabled={working}>Create invitation</button>
      </form>

      <section className="member-list" aria-label="Workbench memberships">
        <header><span>Member</span><span>Role</span><span>Status</span><span>Last seen</span></header>
        {members.length === 0 ? <p className="member-list__empty">No stored members yet. Local preview access is temporary and is not a production membership.</p> : null}
        {members.map((member) => (
          <article key={member.id}>
            <div><strong>{member.displayName}</strong><small>{member.email}</small></div>
            <select
              aria-label={`Role for ${member.email}`}
              value={member.role}
              disabled={working}
              onChange={(event) => void updateMember(member, { role: event.target.value as WorkbenchMember["role"], status: member.status })}
            >
              {workbenchRoles.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select
              aria-label={`Status for ${member.email}`}
              value={member.status}
              disabled={working}
              onChange={(event) => void updateMember(member, { role: member.role, status: event.target.value as WorkbenchMember["status"] })}
            >
              {workbenchMemberStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
            <time>{member.lastSeenAt ? formatWorkbenchDate(member.lastSeenAt) : "Never"}</time>
          </article>
        ))}
      </section>
      {notice ? <p className="editor-notice" role="status">{notice}</p> : null}
    </div>
  );
}
