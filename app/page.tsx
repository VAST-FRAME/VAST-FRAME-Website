import type { Metadata } from "next";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { sdkProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "VASTFRAME — Real-Time Technology Studio" },
  description:
    "Rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.",
};

export default function Home() {
  return (
    <PublicShell active="/">
      <section className="home-hero frame-grid">
        <p className="eyebrow home-hero__eyebrow">VASTFRAME / Technology studio</p>
        <h1 className="display home-hero__title">
          Real-time systems.
          <br />
          <em>Built together.</em>
        </h1>
        <p className="home-hero__intro">
          VASTFRAME builds rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.
        </p>
        <div className="home-hero__actions">
          <ArrowLink href="/sdk">Explore the SDK</ArrowLink>
          <ArrowLink href="/docs">Read the documentation</ArrowLink>
        </div>
        <MediaPlaceholder slot="SDK_SYSTEMS_HERO" ratio="4 / 5" tone="turquoise" className="home-hero__media">
          <span className="placeholder-title">Threshold / Atrium / Eclipse / Causality</span>
          <span className="placeholder-note">Technical capture pending</span>
        </MediaPlaceholder>
        <p className="home-hero__index mono">VF / 001</p>
      </section>

      <section className="manifesto frame-grid section-rule">
        <p className="eyebrow">The studio</p>
        <p className="manifesto__statement">
          We build foundational technology for worlds that need more than off-the-shelf answers.
        </p>
        <p className="manifesto__aside">
          Threshold, Atrium, Eclipse, and Causality are developed as one production stack.
        </p>
      </section>

      <section className="technology section-rule">
        <div className="section-heading frame-grid">
          <p className="eyebrow">VASTFRAME SDK</p>
          <h2 className="display display--section">Four systems. One stack.</h2>
          <p className="section-note">Rendering, atmosphere, scene processing, and simulation.</p>
        </div>
        <div className="product-strip">
          {sdkProducts.map((product) => (
            <article className="product-tile" key={product.name}>
              <span className="mono product-tile__index">{product.index}</span>
              <span className="eyebrow">{product.kind}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </article>
          ))}
        </div>
        <div className="section-action"><ArrowLink href="/sdk">Explore the SDK</ArrowLink></div>
      </section>
    </PublicShell>
  );
}
