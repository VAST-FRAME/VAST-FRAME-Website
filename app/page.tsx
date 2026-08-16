import type { Metadata } from "next";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { SdkProductStrip } from "@/components/sdk-product-strip";

export const metadata: Metadata = {
  title: { absolute: "VASTFRAME — Real-Time Technology Studio" },
  description: "Integrated real-time technology for Unity.",
};

export default function Home() {
  return (
    <PublicShell active="/">
      <section className="home-hero frame-grid">
        <h1 className="display home-hero__title">
          Cutting-edge tech for Unity.
        </h1>
        <MediaPlaceholder slot="SDK_INTEGRATED_STACK_HERO" ratio="21 / 9" tone="checker" className="home-hero__media">
          <span className="placeholder-title">Threshold / Atrium / Eclipse / Causality</span>
          <span className="placeholder-note">Wide production scene / all four systems visible in one frame</span>
        </MediaPlaceholder>
      </section>

      <section className="technology section-rule">
        <div className="section-heading frame-grid">
          <h2 className="display display--section">Four systems. One stack.</h2>
        </div>
        <SdkProductStrip />
      </section>

      <section className="technology-proof frame-grid section-rule">
        <h2>Made for<br /><em>real worlds.</em></h2>
        <p>The SDK exists to solve production problems encountered in complex real-time projects. Each system is designed to work as part of one coherent stack.</p>
        <ArrowLink href="/docs">Read the documentation</ArrowLink>
      </section>
    </PublicShell>
  );
}
