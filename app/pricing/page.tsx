import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { commercialProducts, licenseTerms } from "@/lib/commercial-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Per-title VASTFRAME SDK pricing for independent developers and studios.",
};

export default function PricingPage() {
  return (
    <PublicShell active="/pricing">
      <header className="page-intro frame-grid">
        <h1 className="display display--page">Pricing.</h1>
        <p className="lede">Each VASTFRAME product is licensed separately, per title.</p>
      </header>

      <section className="license-overview frame-grid section-rule" aria-label="License terms">
        <h2>One license.<br />One title.</h2>
        <div>
          <p>Every product license includes {licenseTerms.term.toLowerCase()} for {licenseTerms.titleAllowance.toLowerCase()}, plus {licenseTerms.updateWindow.toLowerCase()}.</p>
          <p>Versions received during the update window remain usable permanently. Ports, patches, ordinary DLC, and supported-platform editions of the licensed title are included.</p>
          <p>Products are licensed independently. Purchasing multiple VASTFRAME systems does not change the price of any individual license.</p>
        </div>
      </section>

      <section className="pricing-grid section-rule" aria-label="VASTFRAME products">
        {commercialProducts.map((product) => (
          <article className={`pricing-card pricing-card--${product.key}`} key={product.key}>
            <div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>
            <dl className="pricing-card__tiers">
              <div className="pricing-tier">
                <dt>Independent<small>Under $500K</small></dt>
                <dd><strong>${product.independentPriceUsd}</strong><span>USD / title</span></dd>
              </div>
              <div className="pricing-tier">
                <dt>Studio<small>$500K–$10M</small></dt>
                <dd><strong>${product.studioPriceUsd}</strong><span>USD / title</span></dd>
              </div>
              <div className="pricing-tier pricing-tier--enterprise">
                <dt>Enterprise<small>Over $10M</small></dt>
                <dd><a href={`mailto:contact@vastframe.com?subject=${encodeURIComponent(`${product.name} enterprise license`)}`}>Contact</a></dd>
              </div>
            </dl>
            <a className="arrow-link" href={`mailto:contact@vastframe.com?subject=${encodeURIComponent(`${product.name} license`)}`}>
              <span>License {product.name}</span><span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </section>

      <section className="pricing-eligibility frame-grid section-rule">
        <h2>Choose your tier.</h2>
        <div>
          <p>Tier eligibility is based on the license holder&apos;s combined gross revenue and funding during the previous 12 months, including parent companies and controlled affiliates.</p>
          <p>Your tier is set when you purchase. Later growth does not change an existing license; future purchases use your eligibility at that time.</p>
        </div>
      </section>
    </PublicShell>
  );
}
