/* eslint-disable @next/next/no-html-link-for-pages -- Documentation links intentionally use full navigation. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { DocumentBody } from "@/components/document-body";
import { sdkDocuments } from "@/lib/knowledge/sdk-documents";
import { findPublicSdkDocument } from "@/lib/knowledge/public";
import { getSdkProduct } from "@/lib/sdk-data";

type Props = { params: Promise<{ product: string; slug: string }> };
export const dynamic = "force-dynamic";
export function generateStaticParams() { return sdkDocuments.filter((doc) => doc.slug !== "overview").map((doc) => ({ product: doc.productKey!, slug: doc.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { product, slug } = await params; const doc = await findPublicSdkDocument(product, slug); return doc ? { title: doc.title, description: doc.summary, openGraph: { title: doc.title, description: doc.summary, images: [] }, twitter: { title: doc.title, description: doc.summary, images: [] } } : {}; }

export default async function DocumentationArticlePage({ params }: Props) {
  const { product: key, slug } = await params;
  const product = getSdkProduct(key);
  const document = await findPublicSdkDocument(key, slug);
  if (!product || !document) notFound();
  return (
    <DocsShell productKey={key} activeSlug={slug}>
      <article className="docs-article">
        <header><p className="docs-breadcrumb"><a href="/docs">Docs</a><span>/</span><a href={`/docs/${key}`}>{product.name}</a><span>/</span>{document.title}</p><span className="status-chip">{document.versionLabel}</span><h1>{document.title}</h1><p>{document.summary}</p></header>
        <DocumentBody body={document.body} />
        <footer className="docs-article__back"><a href={`/docs/${key}`}>← {product.name} documentation</a><a href={`/sdk/${key}`}>View product showcase ↗</a></footer>
      </article>
    </DocsShell>
  );
}
