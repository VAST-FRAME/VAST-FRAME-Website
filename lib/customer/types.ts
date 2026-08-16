export type CustomerIdentity = {
  id: string;
  email: string;
  displayName: string;
  source: "site" | "preview";
};
export type CustomerAccount = {
  identity: CustomerIdentity;
  organization: { id: string; name: string };
  role: "owner" | "admin" | "member";
  preview: boolean;
};

export type CustomerLicense = {
  id: string;
  productKey: string;
  productName: string;
  state: "active" | "refunded" | "revoked";
  assignmentStatus: "unassigned" | "development" | "released";
  assignedTitle: string | null;
  purchasedAt: string;
  updatesEndAt: string;
  releasedAt: string | null;
};

export type EntitledRelease = {
  id: string;
  productKey: string;
  productName: string;
  version: string;
  channel: "stable" | "preview";
  unityVersion: string;
  filename: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  checksumSha256: string;
  releaseNotes: string;
  publishedAt: string;
};

export type CustomerOrder = {
  id: string;
  provider: string;
  externalOrderId: string;
  status: "pending" | "paid" | "refunded" | "failed";
  amountMinor: number;
  currency: string;
  createdAt: string;
};
