"use client";

import { useRef } from "react";
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
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  function playPreview(slug: string) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = videoRefs.current[slug];
    if (video) void video.play().catch(() => undefined);
  }

  function resetPreview(slug: string) {
    const video = videoRefs.current[slug];
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  return (
    <nav className="product-strip product-strip--navigation" aria-label="SDK products">
      {sdkProducts.map((product) => {
        const capture = sdkNavigationCaptures[product.slug];

        return (
          <a
            className={`product-tile product-tile--${product.slug}`}
            href={`/sdk/${product.slug}`}
            aria-current={activeSlug === product.slug ? "page" : undefined}
            onMouseEnter={() => playPreview(product.slug)}
            onMouseLeave={() => resetPreview(product.slug)}
            onFocus={() => playPreview(product.slug)}
            onBlur={() => resetPreview(product.slug)}
            key={product.name}
          >
            {product.slug === "atrium" ? (
              <div className="product-tile__media product-tile__motion">
                <video
                  ref={(element) => { videoRefs.current[product.slug] = element; }}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/media/atrium-aurora-poster.png"
                  aria-hidden="true"
                >
                  <source src="/media/atrium-aurora.mp4" type="video/mp4" />
                </video>
              </div>
            ) : (
              <MediaPlaceholder
                slot={capture.slot}
                ratio="4 / 3"
                tone={capture.tone}
                className="product-tile__media"
              >
                <span className="placeholder-kicker">{capture.title}</span>
              </MediaPlaceholder>
            )}
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
