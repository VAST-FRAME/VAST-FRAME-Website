import type { Metadata } from "next";
import { AccountEmptyState, CustomerShell } from "@/components/customer-shell";
import { requireCustomerAccount } from "@/lib/customer/auth";
import { formatDate } from "@/lib/customer/format";

export const metadata: Metadata = { title: "Licenses", description: "Manage VASTFRAME product licenses and shipped-title assignments." };
export const dynamic = "force-dynamic";

export default async function LicensesPage() {
  const account = await requireCustomerAccount("/account/licenses");
  const { getCustomerLicenses } = await import("@/lib/customer/database");
  const licenses = await getCustomerLicenses(account.organization.id);

  return (
    <CustomerShell account={account} active="/account/licenses">
      <header className="account-page-title"><h2>Licenses.</h2><p>A separate perpetual license is required for every VASTFRAME product used in each shipped title.</p></header>
      {licenses.length ? (
        <section className="license-list">
          {licenses.map((license) => (
            <article key={license.id}>
              <div><span>{license.state}</span><h3>{license.productName}</h3><p>{license.assignedTitle ?? "Not yet assigned to a released product"}</p></div>
              <dl>
                <div><dt>Project status</dt><dd>{license.assignmentStatus}</dd></div>
                <div><dt>Purchased</dt><dd>{formatDate(license.purchasedAt)}</dd></div>
                <div><dt>Updates through</dt><dd>{formatDate(license.updatesEndAt)}</dd></div>
                <div><dt>Use term</dt><dd>Perpetual</dd></div>
              </dl>
            </article>
          ))}
        </section>
      ) : (
        <AccountEmptyState title="No licenses yet." body="Purchased and manually granted product licenses will appear here. Internal use is unlimited; each license clears one released title." action={{ href: "/pricing", label: "View pricing" }} />
      )}
    </CustomerShell>
  );
}
