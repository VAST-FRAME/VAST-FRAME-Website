/* eslint-disable @next/next/no-html-link-for-pages -- Documentation links intentionally use full navigation. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { DocumentBody } from "@/components/document-body";
import { findPublicSdkDocument, publicDocumentsForProduct } from "@/lib/knowledge/public";
import { getSdkProduct, sdkProducts } from "@/lib/sdk-data";

type Props = { params: Promise<{ product: string }> };
export const dynamic = "force-dynamic";
export function generateStaticParams() { return sdkProducts.map((product) => ({ product: product.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const product = getSdkProduct((await params).product); return product ? { title: `${product.name} documentation`, description: product.description, openGraph: { title: `${product.name} documentation`, description: product.description, images: [] }, twitter: { title: `${product.name} documentation`, description: product.description, images: [] } } : {}; }

export default async function ProductDocsPage({ params }: Props) {
  const key = (await params).product;
  const product = getSdkProduct(key);
  const document = await findPublicSdkDocument(key);
  if (!product || !document) notFound();
  const related = (await publicDocumentsForProduct(key)).filter((item) => item.slug !== "overview");
  return (
    <DocsShell productKey={key} activeSlug="overview">
      <article className="docs-article">
        <header><p className="docs-breadcrumb"><a href="/docs">Docs</a><span>/</span>{product.name}</p><span className="status-chip">{document.versionLabel}</span><h1>{document.title}</h1><p>{document.summary}</p></header>
        <DocumentBody body={document.body} />
        <footer><p className="eyebrow">Continue reading</p>{related.map((item) => <a href={`/docs/${key}/${item.slug}`} key={item.id}><strong>{item.title}</strong><span>{item.summary}</span><b>↗</b></a>)}</footer>
      </article>
    </DocsShell>
  );
}
