import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { SdkHero } from "@/components/sdk-hero";
import { SdkProductStrip } from "@/components/sdk-product-strip";

export const metadata: Metadata = {
  title: { absolute: "VASTFRAME — Real-Time Technology Studio" },
  description: "Integrated real-time technology for Unity.",
};

export default function Home() {
  return (
    <PublicShell active="/">
      <section className="technology technology--sdk">
        <SdkHero
          kind="Unity technology"
          title="VASTFRAME SDK"
          description="Cutting-edge tech for Unity."
          documentationHref="/docs"
        />
        <SdkProductStrip />
      </section>

      <section className="technology-proof frame-grid section-rule">
        <h2>Made for<br /><em>real worlds.</em></h2>
        <p>The SDK exists to solve production problems encountered in complex real-time projects. Each system is designed to work as part of one coherent stack.</p>
      </section>
    </PublicShell>
  );
}
