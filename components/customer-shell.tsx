import type { ReactNode } from "react";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { PublicShell } from "@/components/public-shell";
import type { CustomerAccount } from "@/lib/customer/types";

const accountNavigation = [
  { href: "/account", label: "Overview" },
  { href: "/account/downloads", label: "Downloads" },
  { href: "/account/licenses", label: "Licenses" },
  { href: "/account/billing", label: "Billing" },
] as const;

export function CustomerShell({ account, active, children }: { account: CustomerAccount; active: string; children: ReactNode }) {
  return (
    <PublicShell active="/account">
      <header className="account-heading">
        <div>
          <span>Customer account</span>
          <h1>{account.organization.name}</h1>
        </div>
        <div className="account-identity">
          <strong>{account.identity.displayName}</strong>
          <span>{account.identity.email}</span>
          {account.preview ? <small>Local preview</small> : <a href={chatGPTSignOutPath("/")}>Sign out</a>}
        </div>
      </header>
      <nav className="account-nav" aria-label="Customer account navigation">
        {accountNavigation.map((item) => (
          <a href={item.href} aria-current={active === item.href ? "page" : undefined} key={item.href}>{item.label}</a>
        ))}
      </nav>
      {children}
    </PublicShell>
  );
}

export function AccountEmptyState({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <section className="account-empty">
      <h2>{title}</h2>
      <p>{body}</p>
      {action ? <a className="arrow-link" href={action.href}><span>{action.label}</span><span aria-hidden="true">↗</span></a> : null}
    </section>
  );
}
