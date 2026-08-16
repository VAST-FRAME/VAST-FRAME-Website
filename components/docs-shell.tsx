/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation is intentional behind the preview access gateway. */
import type { ReactNode } from "react";
import { PublicShell } from "./public-shell";
import { documentationProducts } from "@/lib/knowledge/sdk-documents";
import { getPublicSdkDocuments } from "@/lib/knowledge/public";
import { sdkProducts } from "@/lib/sdk-data";

export async function DocsShell({ productKey, activeSlug, children }: { productKey?: string; activeSlug?: string; children: ReactNode }) {
  const publicDocuments = await getPublicSdkDocuments();
  return (
    <PublicShell active="/docs" inverted>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <a className="docs-sidebar__home" href="/docs"><span>VF</span><strong>SDK Documentation</strong></a>
          <form className="docs-search" action="/docs/search"><label htmlFor="docs-query">Search documentation</label><div><input id="docs-query" name="q" type="search" placeholder="Shadows, streaming…" /><button type="submit" aria-label="Search">↗</button></div></form>
          <label className="docs-version"><span>Documentation version</span><select defaultValue="0.x"><option value="0.x">0.x / Development</option></select></label>
          <nav aria-label="Documentation navigation">
            {documentationProducts.map((key) => {
              const product = sdkProducts.find((item) => item.slug === key)!;
              const documents = publicDocuments.filter((document) => document.productKey === key).sort((a, b) => a.navOrder - b.navOrder);
              return (
                <details open={productKey === key} key={key}>
                  <summary>{product.name}</summary>
                  <div>{documents.map((document) => <a href={`/docs/${key}${document.slug === "overview" ? "" : `/${document.slug}`}`} aria-current={productKey === key && activeSlug === document.slug ? "page" : undefined} key={document.id}>{document.title.replace(`${product.name} `, "")}</a>)}</div>
                </details>
              );
            })}
          </nav>
          <footer><span>Public documentation</span><a href="/sdk">SDK showcase ↗</a></footer>
        </aside>
        <main className="docs-main">{children}</main>
      </div>
    </PublicShell>
  );
}
