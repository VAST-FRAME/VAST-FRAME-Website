/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation is intentional behind the preview access gateway. */
import type { ReactNode } from "react";
import { publicNavigation } from "@/lib/site-data";

type PublicShellProps = {
  active?: string;
  children: ReactNode;
  inverted?: boolean;
};

export function PublicShell({ active, children, inverted = false }: PublicShellProps) {
  return (
    <div className={inverted ? "site site--paper" : "site"}>
      <header className="site-header">
        <a href="/" className="wordmark" aria-label="VASTFRAME home">
          VAST<span>FRAME</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {publicNavigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {publicNavigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </details>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div>
          <span className="wordmark wordmark--footer">
            VAST<span>FRAME</span>
          </span>
          <p>Independent games. Deeply built worlds.</p>
        </div>
        <div className="site-footer__links">
          <a href="/games">Games</a>
          <a href="/contact">Contact</a>
          <a href="/workbench" className="quiet-link">
            Workbench
          </a>
        </div>
        <p className="site-footer__legal">© 2026 VASTFRAME</p>
      </footer>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: ReactNode;
  body: string;
}) {
  return (
    <section className="page-intro frame-grid">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display display--page">{title}</h1>
      <p className="lede">{body}</p>
    </section>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="arrow-link">
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
