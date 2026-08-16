import { ArrowLink } from "@/components/public-shell";

type SdkHeroProps = {
  kind: string;
  title: string;
  description: string;
  documentationHref: string;
  statement?: string;
};

export function SdkHero({
  kind,
  title,
  description,
  documentationHref,
  statement,
}: SdkHeroProps) {
  return (
    <header className={`technology-hero frame-grid${statement ? "" : " technology-hero--overview"}`}>
      <p className="mono technology-hero__kind">{kind}</p>
      <h1 className="display technology-hero__title">{title}</h1>
      {statement ? <p className="technology-hero__statement">{statement}</p> : null}
      <p className="technology-hero__description">{description}</p>
      <div className="technology-hero__actions">
        <ArrowLink href={documentationHref}>Read the documentation</ArrowLink>
        <span className="status-chip">In active development</span>
      </div>
    </header>
  );
}
