import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { PublicShell } from "@/components/public-shell";
import { SdkHero } from "@/components/sdk-hero";
import { SdkProductStrip } from "@/components/sdk-product-strip";
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
        <SdkHero
          title={product.name}
          statement={product.statement}
          description={product.description}
          documentationHref={`/docs/${product.slug}`}
        />

        <SdkProductStrip activeSlug={product.slug} />

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
          <div className="capability-index__grid">
            {product.capabilities.map((group) => (
              <article key={group.title}>
                <h2>{group.title}</h2>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="technology-gallery section-rule" aria-label={`${product.name} planned screenshots`}>
          <header className="technology-gallery__header frame-grid">
            <h2>Rendering showcase</h2>
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

      </article>
    </PublicShell>
  );
}
