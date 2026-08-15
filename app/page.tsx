import type { Metadata } from "next";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { sdkProducts, splinterheart } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "VASTFRAME — Independent Game Studio" },
  description:
    "Independent games, deeply built worlds, and the technology beneath them.",
};

export default function Home() {
  return (
    <PublicShell active="/">
      <section className="home-hero frame-grid">
        <p className="eyebrow home-hero__eyebrow">Independent game studio</p>
        <h1 className="display home-hero__title">
          Worlds with{" "}
          <br />
          <em>weight.</em>
        </h1>
        <p className="home-hero__intro">
          VASTFRAME makes games with atmosphere, consequence, and machinery you can feel beneath the surface.
        </p>
        <div className="home-hero__actions">
          <ArrowLink href="/games/splinterheart">Enter Splinterheart</ArrowLink>
          <ArrowLink href="/sdk">Explore the technology</ArrowLink>
        </div>
        <MediaPlaceholder slot="HOME_HERO" ratio="4 / 5" tone="pink" className="home-hero__media">
          <span className="placeholder-title">Splinterheart</span>
          <span className="placeholder-note">Final key art pending</span>
        </MediaPlaceholder>
        <p className="home-hero__index mono">VF / 001</p>
      </section>

      <section className="manifesto frame-grid section-rule">
        <p className="eyebrow">What we care about</p>
        <p className="manifesto__statement">
          We build strange places, tactile systems, and stories that trust the player to look closer.
        </p>
        <p className="manifesto__aside">
          The tools are part of the craft. When the game asks for something new, we build the technology to meet it.
        </p>
      </section>

      <section className="featured-game section-rule">
        <div className="section-heading frame-grid">
          <p className="eyebrow">Now in development</p>
          <h2 className="display display--section">{splinterheart.name}</h2>
          <span className="status-chip">{splinterheart.status}</span>
        </div>
        <div className="featured-game__body frame-grid">
          <MediaPlaceholder slot="SPLINTERHEART_WIDE_01" ratio="21 / 9" tone="checker" />
          <p className="lede">{splinterheart.statement}</p>
          <ArrowLink href="/games/splinterheart">View the game</ArrowLink>
        </div>
      </section>

      <section className="technology section-rule">
        <div className="section-heading frame-grid">
          <p className="eyebrow">Technology by VASTFRAME</p>
          <h2 className="display display--section">Built beneath the game.</h2>
          <p className="section-note">Four focused systems. One connected production stack.</p>
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

      <section className="steam-note section-rule frame-grid">
        <p className="eyebrow">Development updates</p>
        <p className="mono steam-note__index">VF / STEAM</p>
        <h2>News, when there is news.</h2>
        <p>Splinterheart updates will live on Steam once its store page is ready. Until then, we are concentrating on the game.</p>
        <ArrowLink href="/games/splinterheart">See Splinterheart</ArrowLink>
      </section>
    </PublicShell>
  );
}
