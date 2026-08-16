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
        <h1>Documentation.</h1>
        <p>Technical reference for Threshold, Atrium, Eclipse, and Causality, covering system architecture, capabilities, integration guidance, and APIs.</p>
      </header>
      <section className="docs-product-grid">
        {sdkProducts.map((product) => (
          <a href={`/docs/${product.slug}`} key={product.slug}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <small>{documents.filter((document) => document.productKey === product.slug).length} articles →</small>
          </a>
        ))}
      </section>
    </DocsShell>
  );
}
