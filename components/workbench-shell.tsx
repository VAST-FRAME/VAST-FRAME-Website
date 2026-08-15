/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation is intentional behind the preview access gateway. */
import type { ReactNode } from "react";
import type { WorkbenchAccess } from "@/lib/workbench/auth";

const navigation = [
  { href: "/workbench", label: "Overview", index: "01" },
  { href: "/workbench/wiki", label: "Knowledge", index: "02" },
  { href: "/workbench/members", label: "Members", index: "03" },
  { href: "/workbench/operations", label: "Operations", index: "04" },
] as const;

export function WorkbenchShell({
  access,
  active,
  children,
}: {
  access: WorkbenchAccess;
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="workbench">
      <aside className="workbench-sidebar">
        <a href="/workbench" className="workbench-brand">
          <span>VF</span>
          <strong>Workbench</strong>
        </a>
        <nav aria-label="Workbench navigation">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
            >
              <span>{item.index}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="workbench-sidebar__foot">
          {access.preview ? <span className="preview-flag">Local preview</span> : null}
          <strong>{access.identity.displayName}</strong>
          <span>{access.role}</span>
          <a href="/games">Games preview ↗</a>
          <a href="/">Public site ↗</a>
        </div>
      </aside>
      <div className="workbench-main">
        <header className="workbench-topbar">
          <p>VASTFRAME / Internal</p>
          <span className="workbench-status"><i /> Private workspace</span>
        </header>
        {children}
      </div>
    </div>
  );
}

export function WorkbenchAccessScreen({ signedIn }: { signedIn: boolean }) {
  return (
    <main className="access-screen">
      <div className="access-screen__brand">VAST<span>FRAME</span></div>
      <div className="access-screen__panel">
        <p className="eyebrow">Developer Workbench</p>
        <h1>{signedIn ? "Invitation required." : "The workshop is private."}</h1>
        <p>
          {signedIn
            ? "Your identity is valid, but it is not attached to an active VASTFRAME membership. Ask a Workbench administrator for access."
            : "Sign in with the email address on your VASTFRAME invitation. Authentication identifies you; an active studio membership grants access."}
        </p>
        {!signedIn ? (
          <a href="/signin-with-chatgpt?return_to=%2Fworkbench" className="workbench-button workbench-button--primary">
            Continue to secure sign-in
          </a>
        ) : null}
        <a href="/" className="access-screen__back">← Return to vastframe.com</a>
      </div>
    </main>
  );
}
