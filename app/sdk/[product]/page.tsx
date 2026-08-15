import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { ArrowLink, PublicShell } from "@/components/public-shell";
import { getSdkProduct, sdkProducts } from "@/lib/sdk-data";

type ProductPageProps = { params: Promise<{ product: string }> };

export function generateStaticParams() {
  return sdkProducts.map((product) => ({ product: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getSdkProduct((await params).product);
  if (!product) return {};
  return {
    title: `${product.name} — VASTFRAME SDK`,
    description: product.description,
    openGraph: { title: `${product.name} — VASTFRAME SDK`, description: product.description, images: [] },
    twitter: { title: `${product.name} — VASTFRAME SDK`, description: product.description, images: [] },
  };
}

export default async function SdkProductPage({ params }: ProductPageProps) {
  const product = getSdkProduct((await params).product);
  if (!product) notFound();

  return (
    <PublicShell active={`/sdk/${product.slug}`}>
      <article className={`technology technology--${product.slug}`}>
        <header className="technology-hero frame-grid">
          <p className="eyebrow">VASTFRAME SDK / {product.index}</p>
          <p className="mono technology-hero__kind">{product.kind}</p>
          <h1 className="display technology-hero__title">{product.name}</h1>
          <p className="technology-hero__statement">{product.statement}</p>
          <p className="technology-hero__description">{product.description}</p>
          <div className="technology-hero__actions">
            <ArrowLink href={`/docs/${product.slug}`}>Read the documentation</ArrowLink>
            <span className="status-chip">In active development</span>
          </div>
        </header>

        <section className="technology-lead-media">
          <MediaPlaceholder
            slot={product.media[0].slot}
            ratio={product.media[0].ratio}
            tone={product.media[0].tone}
            className="technology-media technology-media--hero"
          >
            <span className="placeholder-kicker">Final capture direction</span>
            <span className="placeholder-title">{product.media[0].title}</span>
            <span className="placeholder-note">{product.media[0].direction}</span>
          </MediaPlaceholder>
        </section>

        <section className="capability-index frame-grid section-rule">
          <p className="eyebrow">Capability index</p>
          <div className="capability-index__grid">
            {product.capabilities.map((group, index) => (
              <article key={group.title}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <h2>{group.title}</h2>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="technology-gallery section-rule" aria-label={`${product.name} planned screenshots`}>
          <header className="technology-gallery__header frame-grid">
            <p className="eyebrow">Visual proof plan</p>
            <h2>Every image has a job.</h2>
            <p>These are production capture briefs—not decorative boxes. Each slot names the exact proof the final screenshot must provide.</p>
          </header>
          <div className="technology-gallery__grid">
            {product.media.slice(1).map((media, index) => (
              <figure className={`technology-shot technology-shot--${media.size}`} key={media.slot}>
                <MediaPlaceholder slot={media.slot} ratio={media.ratio} tone={media.tone}>
                  <span className="placeholder-kicker">Capture {String(index + 2).padStart(2, "0")}</span>
                  <span className="placeholder-title">{media.title}</span>
                </MediaPlaceholder>
                <figcaption><strong>{media.title}</strong><span>{media.direction}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="technology-proof frame-grid section-rule">
          <p className="eyebrow">Built for production</p>
          <h2>Made for<br /><em>real worlds.</em></h2>
          <p>The SDK exists to solve production problems encountered in complex real-time projects. Each system is designed to work as part of one coherent stack.</p>
          <ArrowLink href={`/docs/${product.slug}`}>Read the documentation</ArrowLink>
        </section>

        <nav className="technology-next section-rule" aria-label="SDK products">
          {sdkProducts.map((item) => (
            <a href={`/sdk/${item.slug}`} aria-current={item.slug === product.slug ? "page" : undefined} key={item.slug}>
              <span>{item.index}</span><strong>{item.name}</strong><small>{item.kind}</small>
            </a>
          ))}
        </nav>
      </article>
    </PublicShell>
  );
}
