import { getChatGPTUser, requireChatGPTUser } from "@/app/chatgpt-auth";
import type { CustomerAccount, CustomerIdentity } from "./types";

export async function getCustomerIdentity(): Promise<CustomerIdentity | null> {
  const siteUser = await getChatGPTUser();
  if (siteUser) {
    return {
      id: siteUser.userId,
      email: siteUser.email.toLowerCase(),
      displayName: siteUser.displayName,
      source: "site",
    };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      id: "local-customer-preview",
      email: "customer-preview@vastframe.local",
      displayName: "Local customer",
      source: "preview",
    };
  }

  return null;
}

export async function getCustomerAccount(): Promise<CustomerAccount | null> {
  const identity = await getCustomerIdentity();
  if (!identity) return null;
  const { ensureCustomerAccount } = await import("./database");
  return ensureCustomerAccount(identity);
}

export async function requireCustomerAccount(returnTo: string): Promise<CustomerAccount> {
  let identity = await getCustomerIdentity();
  if (!identity) {
    const siteUser = await requireChatGPTUser(returnTo);
    identity = {
      id: siteUser.userId,
      email: siteUser.email.toLowerCase(),
      displayName: siteUser.displayName,
      source: "site",
    };
  }
  const { ensureCustomerAccount } = await import("./database");
  return ensureCustomerAccount(identity);
}
