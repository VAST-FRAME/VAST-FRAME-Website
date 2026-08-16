import type { Metadata } from "next";
import { CustomerShell } from "@/components/customer-shell";
import { requireCustomerAccount } from "@/lib/customer/auth";

export const metadata: Metadata = { title: "Account", description: "VASTFRAME customer account." };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const account = await requireCustomerAccount("/account");
  const { getCustomerLicenses, getCustomerOrders, getEntitledReleases } = await import("@/lib/customer/database");
  const [licenses, releases, orders] = await Promise.all([
    getCustomerLicenses(account.organization.id),
    getEntitledReleases(account.organization.id),
    getCustomerOrders(account.organization.id),
  ]);

  return (
    <CustomerShell account={account} active="/account">
      <section className="account-overview">
        <article><span>Active licenses</span><strong>{licenses.filter((license) => license.state === "active").length}</strong><a href="/account/licenses">View licenses →</a></article>
        <article><span>Available releases</span><strong>{releases.length}</strong><a href="/account/downloads">Open downloads →</a></article>
        <article><span>Orders</span><strong>{orders.length}</strong><a href="/account/billing">View billing →</a></article>
      </section>
      <section className="account-principle section-rule">
        <h2>Your tools remain yours.</h2>
        <p>Each license is perpetual for one shipped product. Releases published during its two-year update window stay in your download library permanently.</p>
      </section>
    </CustomerShell>
  );
}
