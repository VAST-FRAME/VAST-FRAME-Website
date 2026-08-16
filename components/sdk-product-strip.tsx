import { MediaPlaceholder } from "@/components/media-placeholder";
import { sdkProducts } from "@/lib/sdk-data";

const sdkNavigationCaptures = {
  threshold: {
    slot: "THRESHOLD_MATERIAL_RESPONSE_NAV",
    title: "BRDF and subsurface material study",
    tone: "threshold",
  },
  atrium: {
    slot: "ATRIUM_CELESTIAL_FIELD_NAV",
    title: "Atmosphere and celestial field",
    tone: "atrium",
  },
  eclipse: {
    slot: "ECLIPSE_UV_PIPELINE_NAV",
    title: "Scene preparation and UV output",
    tone: "eclipse",
  },
  causality: {
    slot: "CAUSALITY_PROPAGATION_NAV",
    title: "Energy and fire propagation",
    tone: "causality",
  },
} as const;

export function SdkProductStrip({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="product-strip product-strip--navigation" aria-label="SDK products">
      {sdkProducts.map((product) => {
        const capture = sdkNavigationCaptures[product.slug];

        return (
          <a
            className={`product-tile product-tile--${product.slug}`}
            href={`/sdk/${product.slug}`}
            aria-current={activeSlug === product.slug ? "page" : undefined}
            key={product.name}
          >
            <MediaPlaceholder
              slot={capture.slot}
              ratio="4 / 3"
              tone={capture.tone}
              className="product-tile__media"
            >
              <span className="placeholder-kicker">{capture.title}</span>
            </MediaPlaceholder>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span className="arrow-link product-tile__link">
              <span>Explore {product.name}</span>
              <span aria-hidden="true">↗</span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
