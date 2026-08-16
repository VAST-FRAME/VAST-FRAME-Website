import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { commercialProducts, licenseTerms } from "@/lib/commercial-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Perpetual VASTFRAME SDK product licenses for one shipped title.",
};

export default function PricingPage() {
  return (
    <PublicShell active="/pricing">
      <header className="pricing-hero frame-grid">
        <h1 className="display display--page">License what<br />you need.</h1>
        <p>Each VASTFRAME product is licensed separately. Every license covers unlimited internal R&amp;D and one shipped, released product.</p>
      </header>

      <section className="license-summary section-rule" aria-label="License terms">
        <article><strong>{licenseTerms.term}</strong><span>Keep using the licensed version for the life of the shipped product.</span></article>
        <article><strong>{licenseTerms.updateWindow}</strong><span>Releases published during the update window remain available permanently.</span></article>
        <article><strong>{licenseTerms.releaseAllowance}</strong><span>All supported platform editions of the same title are covered.</span></article>
        <article><strong>{licenseTerms.internalUse}</strong><span>Prototype, research, and build internally without seat limits.</span></article>
      </section>

      <section className="pricing-grid section-rule" aria-label="VASTFRAME products">
        {commercialProducts.map((product) => (
          <article className={`pricing-card pricing-card--${product.key}`} key={product.key}>
            <div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>
            <strong className="pricing-card__price">{product.priceLabel}</strong>
            <dl>
              <div><dt>License</dt><dd>Perpetual</dd></div>
              <div><dt>Release</dt><dd>One shipped product</dd></div>
              <div><dt>Updates</dt><dd>Two years</dd></div>
              <div><dt>Internal use</dt><dd>Unlimited</dd></div>
            </dl>
            <a className="arrow-link" href={`mailto:contact@vastframe.com?subject=${encodeURIComponent(`${product.name} license`)}`}>
              <span>Contact us</span><span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </section>

      <section className="license-definition frame-grid section-rule">
        <h2>One product.<br />One shipped title.</h2>
        <div>
          <p>Products are licensed independently. Purchasing multiple VASTFRAME systems does not change the price of any individual license.</p>
          <p>Updates, patches, ordinary DLC, public demos, and supported-platform releases for the licensed title are covered. Sequels, standalone expansions, remasters, and distinct released products require another license.</p>
          <p>Contractors may use the software while working for the license holder, but receive no independent license or reuse rights.</p>
        </div>
      </section>
    </PublicShell>
  );
}
