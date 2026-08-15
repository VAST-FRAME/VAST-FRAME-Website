import type { CSSProperties, ReactNode } from "react";
import type { MediaTone } from "@/lib/site-data";

type MediaPlaceholderProps = {
  slot: string;
  ratio?: string;
  tone?: MediaTone;
  className?: string;
  children?: ReactNode;
};

export function MediaPlaceholder({
  slot,
  ratio = "16 / 9",
  tone = "neutral",
  className = "",
  children,
}: MediaPlaceholderProps) {
  return (
    <div
      className={`media-placeholder media-placeholder--${tone} ${className}`}
      style={{ "--media-ratio": ratio } as CSSProperties}
      role="img"
      aria-label={`Placeholder media for ${slot}`}
    >
      <div className="media-placeholder__cross" aria-hidden="true" />
      <span className="media-placeholder__slot">{slot}</span>
      <span className="media-placeholder__ratio">{ratio.replace("/", ":")}</span>
      {children ? <div className="media-placeholder__content">{children}</div> : null}
    </div>
  );
}

