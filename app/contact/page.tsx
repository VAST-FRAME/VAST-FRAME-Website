import type { Metadata } from "next";
import { PageIntro, PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact VASTFRAME.",
};

const contactEmail = "contact@vastframe.com";

export default function ContactPage() {
  return (
    <PublicShell active="/contact" inverted>
      <PageIntro
        title={<>Contact<br /><em>us.</em></>}
        body="For portfolios, press, business, and general studio inquiries, send us an email."
      />
      <section className="contact-list section-rule">
        <a className="contact-row" href={`mailto:${contactEmail}`}>
          <span>Email</span>
          <strong>{contactEmail}</strong>
          <span aria-hidden="true">↗</span>
        </a>
      </section>
      <section className="contact-note frame-grid section-rule">
        <p>Independent game studio.<br />Working remotely.</p>
      </section>
    </PublicShell>
  );
}
