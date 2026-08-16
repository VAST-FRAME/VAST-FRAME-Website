import type { Metadata } from "next";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { sdkProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "VASTFRAME — Real-Time Technology Studio" },
  description:
    "Rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.",
};

const homeCaptures = {
  threshold: {
    slot: "THRESHOLD_MATERIAL_RESPONSE_HOME",
    title: "BRDF and subsurface material study",
    tone: "neutral",
  },
  atrium: {
    slot: "ATRIUM_CELESTIAL_FIELD_HOME",
    title: "Atmosphere and celestial field",
    tone: "checker",
  },
  eclipse: {
    slot: "ECLIPSE_UV_PIPELINE_HOME",
    title: "Scene preparation and UV output",
    tone: "turquoise",
  },
  causality: {
    slot: "CAUSALITY_PROPAGATION_HOME",
    title: "Energy and fire propagation",
    tone: "neutral",
  },
} as const;

export default function Home() {
  return (
    <PublicShell active="/">
      <section className="home-hero frame-grid">
        <h1 className="display home-hero__title">
          Cutting-edge tech for Unity.
        </h1>
        <p className="home-hero__intro">
          VASTFRAME builds rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.
        </p>
        <div className="home-hero__actions">
          <ArrowLink href="/sdk">Explore the SDK</ArrowLink>
          <ArrowLink href="/docs">Read the documentation</ArrowLink>
        </div>
        <MediaPlaceholder slot="SDK_INTEGRATED_STACK_HERO" ratio="21 / 9" tone="checker" className="home-hero__media">
          <span className="placeholder-title">Threshold / Atrium / Eclipse / Causality</span>
          <span className="placeholder-note">Wide production scene / all four systems visible in one frame</span>
        </MediaPlaceholder>
      </section>

      <section className="technology section-rule">
        <div className="section-heading frame-grid">
          <h2 className="display display--section">Four systems. One stack.</h2>
          <p className="section-note">Rendering, atmosphere, scene processing, and simulation.</p>
        </div>
        <div className="product-strip">
          {sdkProducts.map((product) => (
            <article className="product-tile" key={product.name}>
              <MediaPlaceholder
                slot={homeCaptures[product.slug].slot}
                ratio="4 / 3"
                tone={homeCaptures[product.slug].tone}
                className="product-tile__media"
              >
                <span className="placeholder-kicker">{homeCaptures[product.slug].title}</span>
              </MediaPlaceholder>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
