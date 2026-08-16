import type { Metadata } from "next";
import { AccountEmptyState, CustomerShell } from "@/components/customer-shell";
import { requireCustomerAccount } from "@/lib/customer/auth";
import { formatDate, formatMoney } from "@/lib/customer/format";

export const metadata: Metadata = { title: "Billing", description: "VASTFRAME purchase and invoice history." };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const account = await requireCustomerAccount("/account/billing");
  const { getCustomerOrders } = await import("@/lib/customer/database");
  const orders = await getCustomerOrders(account.organization.id);

  return (
    <CustomerShell account={account} active="/account/billing">
      <header className="account-page-title"><h2>Billing.</h2><p>Purchases belong to the organization and create product-specific license entitlements.</p></header>
      {orders.length ? (
        <section className="order-list">
          {orders.map((order) => (
            <article key={order.id}><div><span>{formatDate(order.createdAt)}</span><strong>{order.externalOrderId}</strong></div><span>{order.status}</span><strong>{formatMoney(order.amountMinor, order.currency)}</strong></article>
          ))}
        </section>
      ) : (
        <AccountEmptyState title="No orders yet." body="Completed purchases, invoices, and refunds will appear here when checkout is connected." action={{ href: "/pricing", label: "View pricing" }} />
      )}
    </CustomerShell>
  );
}
