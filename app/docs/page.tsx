import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { sdkProducts } from "@/lib/sdk-data";
import { getPublicSdkDocuments } from "@/lib/knowledge/public";

export const metadata: Metadata = { title: "SDK Documentation", description: "Public technical documentation for the VASTFRAME SDK." };
export const dynamic = "force-dynamic";

export default async function DocsHomePage() {
  const documents = await getPublicSdkDocuments();
  return (
    <DocsShell>
      <header className="docs-home-hero">
        <p className="eyebrow">Public technical documentation</p>
        <h1>Read the system<br />before you buy it.</h1>
        <p>Architecture, capability boundaries, evaluation guidance, and eventually complete API reference for the technology behind VASTFRAME games.</p>
        <span className="status-chip">0.x documentation</span>
      </header>
      <section className="docs-product-grid">
        {sdkProducts.map((product) => (
          <a href={`/docs/${product.slug}`} key={product.slug}>
            <span className="mono">{product.index} / {product.kind}</span>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <small>{documents.filter((document) => document.productKey === product.slug).length} published articles →</small>
          </a>
        ))}
      </section>
      <section className="docs-home-note">
        <p className="eyebrow">Publication policy</p>
        <h2>Public by design.<br />Explicitly published.</h2>
        <p>Documentation is readable without an account. Drafts, reviews, internal notes, and the studio wiki remain inside the authenticated Workbench until an editor deliberately publishes a revision.</p>
      </section>
    </DocsShell>
  );
}
