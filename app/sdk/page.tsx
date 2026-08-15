import type { Metadata } from "next";
import { ArrowLink, PageIntro, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { sdkProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "SDK",
  description: "Rendering, atmosphere, scene-pipeline, and simulation technology from VASTFRAME.",
};

export default function SdkPage() {
  return (
    <PublicShell active="/sdk">
      <PageIntro
        eyebrow="VASTFRAME SDK"
        title={<>Systems shaped<br />by production.</>}
        body="Four product identities carry VASTFRAME's rendering, atmosphere, scene-pipeline, and simulation technology."
      />
      <section className="sdk-hero section-rule">
        <MediaPlaceholder slot="SDK_SYSTEM_REEL" ratio="21 / 8" tone="checker">
          <span className="placeholder-title">Threshold / Atrium / Eclipse / Causality</span>
          <span className="placeholder-note">Four systems / one production stack</span>
        </MediaPlaceholder>
      </section>
      <section className="sdk-product-list section-rule">
        {sdkProducts.map((product) => (
          <article className="sdk-product" key={product.name}>
            <span className="mono sdk-product__index">{product.index}</span>
            <div>
              <p className="eyebrow">{product.kind}</p>
              <h2>{product.name}</h2>
            </div>
            <p>{product.description}</p>
            <div className="sdk-product__actions">
              <span className="status-chip">In development</span>
              <ArrowLink href={`/sdk/${product.slug}`}>Explore {product.name}</ArrowLink>
            </div>
          </article>
        ))}
      </section>
      <section className="system-map section-rule" aria-labelledby="system-map-title">
        <div className="system-map__intro">
          <p className="eyebrow">Shared production stack</p>
          <h2 id="system-map-title">Different systems.<br />One world.</h2>
          <p>Each tool owns a focused problem while sharing the same production language: light, atmosphere, material, and change.</p>
        </div>
        <ol className="system-map__track">
          {sdkProducts.map((product) => (
            <li key={product.name}><span>{product.index}</span><strong>{product.name}</strong><small>{product.kind}</small></li>
          ))}
        </ol>
      </section>
      <section className="sdk-principle frame-grid section-rule">
        <p className="eyebrow">The principle</p>
        <p className="manifesto__statement">The technology serves the frame. The frame serves the game.</p>
        <div className="sdk-principle__action"><ArrowLink href="/docs">Read the documentation</ArrowLink></div>
      </section>
    </PublicShell>
  );
}
