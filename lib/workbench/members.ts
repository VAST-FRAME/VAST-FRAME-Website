import type { WorkbenchRole } from "./auth";

export const workbenchRoles = ["admin", "editor", "contributor", "viewer"] as const;
export const workbenchMemberStatuses = ["invited", "active", "disabled"] as const;

export type WorkbenchMemberStatus = (typeof workbenchMemberStatuses)[number];

export type WorkbenchMember = {
  id: string;
  email: string;
  displayName: string;
  role: WorkbenchRole;
  status: WorkbenchMemberStatus;
  invitedBy: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
};
