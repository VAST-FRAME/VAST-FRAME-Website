import type { Metadata } from "next";
import { AccountEmptyState, CustomerShell } from "@/components/customer-shell";
import { requireCustomerAccount } from "@/lib/customer/auth";
import { formatBytes, formatDate } from "@/lib/customer/format";

export const metadata: Metadata = { title: "Downloads", description: "Download entitled VASTFRAME product releases." };
export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const account = await requireCustomerAccount("/account/downloads");
  const { getEntitledReleases } = await import("@/lib/customer/database");
  const releases = await getEntitledReleases(account.organization.id);

  return (
    <CustomerShell account={account} active="/account/downloads">
      <header className="account-page-title"><h2>Downloads.</h2><p>Every release published within a license’s update window remains available here permanently.</p></header>
      {releases.length ? (
        <section className="download-list">
          {releases.map((release) => (
            <article key={release.id}>
              <div><span>{release.productName}</span><h3>{release.version}</h3><p>{release.releaseNotes || "Production release."}</p></div>
              <dl>
                <div><dt>Channel</dt><dd>{release.channel}</dd></div>
                <div><dt>Unity</dt><dd>{release.unityVersion}</dd></div>
                <div><dt>Published</dt><dd>{formatDate(release.publishedAt)}</dd></div>
                <div><dt>Size</dt><dd>{formatBytes(release.sizeBytes)}</dd></div>
              </dl>
              <a className="arrow-link" href={`/api/account/downloads/${release.id}`}><span>Download {release.filename}</span><span aria-hidden="true">↓</span></a>
              <code>SHA-256 {release.checksumSha256}</code>
            </article>
          ))}
        </section>
      ) : (
        <AccountEmptyState title="No releases yet." body="Downloads appear after this organization receives a product license and VASTFRAME publishes an entitled release." action={{ href: "/pricing", label: "View product licenses" }} />
      )}
    </CustomerShell>
  );
}
