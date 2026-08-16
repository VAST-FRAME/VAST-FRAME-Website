import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { splinterheart } from "@/lib/site-data";
import { getWorkbenchAccess } from "@/lib/workbench/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Splinterheart",
  description: splinterheart.statement,
};

export default async function SplinterheartPage() {
  if (!await getWorkbenchAccess()) notFound();

  return (
    <PublicShell active="/games">
      <section className="project-hero">
        <MediaPlaceholder slot="SPLINTERHEART_KEY_ART" ratio="16 / 9" tone="turquoise" className="project-hero__media">
          <span className="placeholder-kicker">A game by VASTFRAME</span>
          <span className="project-wordmark">Splinterheart</span>
        </MediaPlaceholder>
      </section>

      <section className="project-statement frame-grid section-rule">
        <h1 className="display display--page">Something is taking shape.</h1>
        <p className="lede">{splinterheart.statement}</p>
      </section>

      <section className="project-gallery section-rule">
        <MediaPlaceholder slot="SPLINTERHEART_CAPTURE_01" ratio="4 / 3" tone="checker" />
        <MediaPlaceholder slot="SPLINTERHEART_CAPTURE_02" ratio="4 / 3" tone="neutral" />
        <MediaPlaceholder slot="SPLINTERHEART_CAPTURE_03" ratio="4 / 3" tone="turquoise" />
      </section>

      <section className="project-footer-cta section-rule frame-grid">
        <h2>Splinterheart news will live on Steam.</h2>
        <ArrowLink href="/contact">Contact the studio</ArrowLink>
      </section>
    </PublicShell>
  );
}
