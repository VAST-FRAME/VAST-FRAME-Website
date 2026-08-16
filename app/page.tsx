import type { Metadata } from "next";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { SdkProductStrip } from "@/components/sdk-product-strip";

export const metadata: Metadata = {
  title: { absolute: "VASTFRAME — Real-Time Technology Studio" },
  description: "Integrated real-time technology for Unity.",
};

export default function Home() {
  return (
    <PublicShell active="/">
      <section className="technology">
        <div className="section-heading frame-grid">
          <h1 className="display display--section">Cutting-edge tech for Unity.</h1>
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
