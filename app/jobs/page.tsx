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
        title={<>VASTFRAME,<br />small team.</>}
        body="We look for people who like making cool things. If this describes you, we'd love to see your work, whether or not there are any listed jobs."
      />
      <section className="empty-state section-rule frame-grid">
        <h2>No openings right now.</h2>
        <p>There are no listed roles at the moment, but you can still introduce yourself and show us what you make.</p>
        <ArrowLink href="/contact">Contact us</ArrowLink>
      </section>
    </PublicShell>
  );
}
