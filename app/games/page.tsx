import type { Metadata } from "next";
import { ArrowLink, PageIntro, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { splinterheart } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Games",
  description: "Games in development at VASTFRAME.",
};

export default function GamesPage() {
  return (
    <PublicShell active="/games">
      <PageIntro
        eyebrow="Games / 01"
        title={<>Made to stay<br />with you.</>}
        body="We make focused games with a strong sense of place. Splinterheart is the first one we are ready to name."
      />
      <section className="slate-strip section-rule" aria-label="Current game slate">
        <div><span>Named projects</span><strong>01</strong></div>
        <div><span>In development</span><strong>01</strong></div>
        <div><span>Announced dates</span><strong>00</strong></div>
        <p>We announce facts when they are useful to players—not to fill a calendar.</p>
      </section>
      <section className="game-feature section-rule">
        <MediaPlaceholder slot="SPLINTERHEART_GAME_INDEX" ratio="16 / 10" tone="turquoise" />
        <div className="game-feature__copy">
          <p className="eyebrow">01 / {splinterheart.status}</p>
          <h2 className="display display--section">{splinterheart.name}</h2>
          <p className="lede">{splinterheart.statement}</p>
          <dl className="fact-list">
            <div><dt>Status</dt><dd>{splinterheart.status}</dd></div>
            <div><dt>Platforms</dt><dd>{splinterheart.platform}</dd></div>
          </dl>
          <ArrowLink href="/games/splinterheart">Open project</ArrowLink>
        </div>
      </section>
    </PublicShell>
  );
}
