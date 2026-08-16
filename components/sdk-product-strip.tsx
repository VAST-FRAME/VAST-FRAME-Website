"use client";

import { useEffect, useRef } from "react";
import { sdkProducts } from "@/lib/sdk-data";

export function SdkProductStrip({ activeSlug }: { activeSlug?: string }) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const tileRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const videos = videoRefs.current;
    const tiles = tileRefs.current;
    const touchPreview = window.matchMedia("(hover: none), (pointer: coarse)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

    if (!touchPreview.matches || reducedMotion.matches || connection?.saveData) return;

    const visibility = new Map<string, number>();
    let activeMobileSlug: string | undefined;

    function stopVideo(slug: string, reset = true) {
      const video = videos[slug];
      if (!video) return;
      video.pause();
      if (reset) video.currentTime = 0;
    }

    function syncPreview() {
      if (document.hidden) {
        Object.keys(videos).forEach((slug) => stopVideo(slug, false));
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      const candidate = sdkProducts
        .filter((product) => (visibility.get(product.slug) ?? 0) >= 0.6)
        .map((product) => {
          const bounds = tiles[product.slug]?.getBoundingClientRect();
          const center = bounds ? bounds.top + bounds.height / 2 : Number.POSITIVE_INFINITY;
          return { slug: product.slug, distance: Math.abs(center - viewportCenter) };
        })
        .sort((a, b) => a.distance - b.distance)[0];

      if (candidate?.slug === activeMobileSlug) {
        const video = videos[candidate.slug];
        if (video?.paused) void video.play().catch(() => undefined);
        return;
      }

      activeMobileSlug = candidate?.slug;
      Object.keys(videos).forEach((slug) => {
        if (slug === activeMobileSlug) {
          void videos[slug]?.play().catch(() => undefined);
        } else {
          stopVideo(slug);
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slug = (entry.target as HTMLElement).dataset.productSlug;
          if (slug) visibility.set(slug, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        syncPreview();
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] },
    );

    Object.values(tiles).forEach((tile) => {
      if (tile) observer.observe(tile);
    });
    document.addEventListener("visibilitychange", syncPreview);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPreview);
      Object.keys(videos).forEach((slug) => stopVideo(slug));
    };
  }, []);

  function usesViewportPreview() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  }

  function playPreview(slug: string) {
    if (usesViewportPreview() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    Object.entries(videoRefs.current).forEach(([otherSlug, video]) => {
      if (otherSlug !== slug && video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    const video = videoRefs.current[slug];
    if (video) void video.play().catch(() => undefined);
  }

  function resetPreview(slug: string) {
    if (usesViewportPreview()) return;
    const video = videoRefs.current[slug];
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  return (
    <nav className="product-strip product-strip--navigation" aria-label="SDK products">
      {sdkProducts.map((product) => {
        return (
          <a
            ref={(element) => { tileRefs.current[product.slug] = element; }}
            className={`product-tile product-tile--${product.slug}`}
            href={`/sdk/${product.slug}`}
            data-product-slug={product.slug}
            aria-current={activeSlug === product.slug ? "page" : undefined}
            onMouseEnter={() => playPreview(product.slug)}
            onMouseLeave={() => resetPreview(product.slug)}
            onFocus={() => playPreview(product.slug)}
            onBlur={() => resetPreview(product.slug)}
            key={product.name}
          >
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
