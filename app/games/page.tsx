import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLink, PageIntro, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { splinterheart } from "@/lib/site-data";
import { getWorkbenchAccess } from "@/lib/workbench/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Games",
  description: "Games from VASTFRAME.",
};

export default async function GamesPage() {
  if (!await getWorkbenchAccess()) notFound();

  return (
    <PublicShell active="/games">
      <PageIntro
        title={<>Worlds that<br />stay with you.</>}
        body="We make games that we love and tell stories that mean something to us, 100% free of external investors, publishers, or backers."
      />
      <section className="game-feature section-rule">
        <MediaPlaceholder slot="SPLINTERHEART_GAME_INDEX" ratio="16 / 10" tone="turquoise" />
        <div className="game-feature__copy">
          <h2 className="display display--section">{splinterheart.name}</h2>
          <p className="lede">{splinterheart.statement}</p>
          <dl className="fact-list">
            <div><dt>Release date</dt><dd>{splinterheart.releaseDate}</dd></div>
            <div><dt>Platforms</dt><dd>{splinterheart.platforms}</dd></div>
          </dl>
          <ArrowLink href="/games/splinterheart">Open project</ArrowLink>
        </div>
      </section>
    </PublicShell>
  );
}
