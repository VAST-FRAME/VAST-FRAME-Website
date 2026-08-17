import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about VASTFRAME products, licensing, accounts, and support.",
};

const faqCategories = [
  {
    id: "licensing",
    title: "Licensing",
    questions: [
      {
        question: "What does one license cover?",
        answer: "One license covers one VASTFRAME product for one commercial title. Supported-platform editions, ports, patches, and ordinary DLC for that title are included. Sequels, standalone expansions, remasters, and separate released titles require another license.",
      },
      {
        question: "Is the license perpetual?",
        answer: "Yes. You may keep using every version received during the two-year update window for the licensed title permanently.",
      },
      {
        question: "Which company tier applies?",
        answer: "Studio pricing applies under $10 million in combined gross revenue and funding during the previous 12 months. Enterprise licensing applies over $10 million.",
      },
      {
        question: "What counts toward tier eligibility?",
        answer: "Eligibility includes the license holder's gross revenue and funding, together with its parent companies and controlled affiliates, during the previous 12 months.",
      },
      {
        question: "What happens if the company grows after purchase?",
        answer: "Growth does not change an existing license. Any future license purchase uses the company's eligibility at the time of that purchase.",
      },
      {
        question: "Are multiple-product discounts available?",
        answer: "No. Every VASTFRAME product is licensed and priced independently.",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    questions: [
      {
        question: "Are Threshold, Eclipse, and Causality separate products?",
        answer: "Yes. Each product may be licensed independently, and each has its own documentation, releases, and entitlement.",
      },
      {
        question: "Is atmosphere a separate product?",
        answer: "No. Physically based atmosphere, celestial rendering, clouds, aurora, and distant phenomena are included in Threshold.",
      },
      {
        question: "Can the products be used together?",
        answer: "Yes. They are designed as a coherent technology stack, while remaining independently usable and licensable.",
      },
      {
        question: "Where can I evaluate technical fit?",
        answer: "The public documentation describes the systems, workflows, and supported features in detail. Contact VASTFRAME for project-specific compatibility questions.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Purchasing and accounts",
    questions: [
      {
        question: "How do I request a license?",
        answer: "Use the request link for the product on the Pricing page or email contact@vastframe.com. Enterprise licensing is handled directly with VASTFRAME.",
      },
      {
        question: "Where are licenses and downloads managed?",
        answer: "Customer licenses, eligible releases, downloads, and billing history are available through the authenticated Account area.",
      },
      {
        question: "Do older eligible releases remain downloadable?",
        answer: "Yes. Releases published during a license's update window remain available to that license permanently.",
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    questions: [
      {
        question: "How do customers contact VASTFRAME?",
        answer: "Email contact@vastframe.com for licensing, account, integration, and general product questions.",
      },
      {
        question: "May contractors use licensed products?",
        answer: "Contractors may use the software while working on the licensed title for the license holder. They receive no independent license or reuse rights.",
      },
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <PublicShell active="/faq">
      <header className="page-intro frame-grid">
        <h1 className="display display--page">FAQ.</h1>
        <p className="lede">Products, licensing, accounts, and support.</p>
      </header>

      <nav className="faq-index section-rule" aria-label="FAQ categories">
        {faqCategories.map((category) => <a href={`#${category.id}`} key={category.id}>{category.title}</a>)}
      </nav>

      {faqCategories.map((category) => (
        <section className="faq-category frame-grid section-rule" id={category.id} key={category.id}>
          <h2>{category.title}</h2>
          <div className="faq-list">
            {category.questions.map((item) => (
              <details key={item.question}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </PublicShell>
  );
}
