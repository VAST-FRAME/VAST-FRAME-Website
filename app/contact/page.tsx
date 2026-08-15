import type { Metadata } from "next";
import { PageIntro, PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact VASTFRAME for general, press, and business inquiries.",
};

const contacts = [
  { label: "General", value: "hello@vastframe.com" },
  { label: "Press", value: "press@vastframe.com" },
  { label: "Business", value: "biz@vastframe.com" },
] as const;

export default function ContactPage() {
  return (
    <PublicShell active="/contact" inverted>
      <PageIntro
        eyebrow="Contact"
        title={<>Start a<br /><em>conversation.</em></>}
        body="For press, business, and general studio inquiries, use the route that fits. We read what reaches us."
      />
      <section className="contact-list section-rule">
        {contacts.map((contact, index) => (
          <a className="contact-row" href={`mailto:${contact.value}`} key={contact.label}>
            <span className="mono">0{index + 1}</span>
            <span>{contact.label}</span>
            <strong>{contact.value}</strong>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </section>
      <section className="contact-note frame-grid section-rule">
        <p className="eyebrow">VASTFRAME</p>
        <p>Independent game studio.<br />Working remotely.</p>
      </section>
    </PublicShell>
  );
}
