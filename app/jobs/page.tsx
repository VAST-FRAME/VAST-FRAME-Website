import type { Metadata } from "next";
import { ArrowLink, PageIntro, PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Open roles at VASTFRAME.",
};

export default function JobsPage() {
  return (
    <PublicShell active="/jobs">
      <PageIntro
        eyebrow="Careers"
        title={<>Small team.<br />Serious craft.</>}
        body="When we hire, we look for people who care about the whole work: the player, the detail, the system, and the result."
      />
      <section className="empty-state section-rule frame-grid">
        <p className="eyebrow">Open roles / 00</p>
        <h2>No openings right now.</h2>
        <p>We will post roles here when there is a real position to fill. No evergreen listings, no résumé collection funnel.</p>
        <ArrowLink href="/contact">Contact the studio</ArrowLink>
      </section>
    </PublicShell>
  );
}

