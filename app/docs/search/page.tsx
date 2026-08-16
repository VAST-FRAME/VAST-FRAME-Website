import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { searchPublicSdkDocuments } from "@/lib/knowledge/public";

export const metadata: Metadata = { title: "Search SDK documentation", description: "Search public VASTFRAME SDK documentation." };
export const dynamic = "force-dynamic";
export default async function DocsSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() ?? "";
  const results = await searchPublicSdkDocuments(query);
  return <DocsShell><section className="docs-results"><h1>{query ? <>Results for <em>“{query}”</em></> : "Search the SDK"}</h1><form className="docs-search docs-search--large" action="/docs/search"><label htmlFor="results-query">Search documentation</label><div><input id="results-query" name="q" defaultValue={query} type="search" /><button type="submit">Search</button></div></form><p className="docs-results__count">{query ? `${results.length} published ${results.length === 1 ? "article" : "articles"}` : "Enter a capability, system, or technical term."}</p><div>{results.map((document) => <a href={`/docs/${document.productKey}${document.slug === "overview" ? "" : `/${document.slug}`}`} key={document.id}><h2>{document.title}</h2><p>{document.summary}</p><b>↗</b></a>)}</div></section></DocsShell>;
}
