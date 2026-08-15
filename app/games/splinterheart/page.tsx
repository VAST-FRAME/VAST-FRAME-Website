import type { Metadata } from "next";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { splinterheart } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Splinterheart",
  description: "Splinterheart, a game in development at VASTFRAME.",
};

export default function SplinterheartPage() {
  return (
    <PublicShell active="/games">
      <section className="project-hero">
        <MediaPlaceholder slot="SPLINTERHEART_KEY_ART" ratio="16 / 9" tone="turquoise" className="project-hero__media">
          <span className="placeholder-kicker">A game by VASTFRAME</span>
          <span className="project-wordmark">Splinterheart</span>
        </MediaPlaceholder>
        <div className="project-hero__caption">
          <span className="eyebrow">In development</span>
          <span className="mono">Image slot 01 / Key art</span>
        </div>
      </section>

      <section className="project-statement frame-grid section-rule">
        <p className="eyebrow">Splinterheart</p>
        <h1 className="display display--page">Something is taking shape.</h1>
        <p className="lede">{splinterheart.statement}</p>
      </section>

      <section className="project-gallery section-rule">
        <MediaPlaceholder slot="SPLINTERHEART_CAPTURE_01" ratio="4 / 3" tone="checker" />
        <MediaPlaceholder slot="SPLINTERHEART_CAPTURE_02" ratio="4 / 3" tone="neutral" />
        <MediaPlaceholder slot="SPLINTERHEART_CAPTURE_03" ratio="4 / 3" tone="turquoise" />
      </section>

      <section className="project-footer-cta section-rule frame-grid">
        <p className="eyebrow">Development updates</p>
        <h2>Splinterheart news will live on Steam.</h2>
        <ArrowLink href="/contact">Contact the studio</ArrowLink>
      </section>
    </PublicShell>
  );
}
