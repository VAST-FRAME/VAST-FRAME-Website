export type MediaTone = "neutral" | "turquoise" | "checker";

export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/contact", label: "Contact" },
] as const;

export const developerNavigation = [
  { href: "/games", label: "Games" },
] as const;

export const sdkNavigation = [
  { href: "/sdk/threshold", label: "Threshold" },
  { href: "/sdk/atrium", label: "Atrium" },
  { href: "/sdk/eclipse", label: "Eclipse" },
  { href: "/sdk/causality", label: "Causality" },
  { href: "/docs", label: "Documentation" },
] as const;

export const splinterheart = {
  name: "Splinterheart",
  slug: "splinterheart",
  releaseDate: "October 2027",
  platforms: "Steam",
  statement:
    "They killed his wife and burned down his home. Now Tiny Man is out for revenge.",
};

export { sdkProducts } from "./sdk-data";
