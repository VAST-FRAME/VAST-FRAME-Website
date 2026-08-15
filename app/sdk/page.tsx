import type { Metadata } from "next";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { sdkProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "SDK",
  description: "The rendering, lighting, sky, and simulation technology beneath VASTFRAME games.",
};

export default function SdkPage() {
  return (
    <PublicShell active="/sdk">
      <PageIntro
        eyebrow="VASTFRAME SDK"
        title={<>Tools shaped<br />by the games.</>}
        body="We build technology when the work demands it. Four product identities carry the rendering and simulation systems beneath VASTFRAME worlds."
      />
      <section className="sdk-hero section-rule">
        <MediaPlaceholder slot="SDK_SYSTEM_REEL" ratio="21 / 8" tone="checker">
          <span className="placeholder-title">Threshold / Eclipse / Firmament / Causality</span>
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
            <span className="status-chip">In development</span>
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
      </section>
    </PublicShell>
  );
}
