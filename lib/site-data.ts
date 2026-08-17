export type MediaTone =
  | "neutral"
  | "turquoise"
  | "checker"
  | "threshold"
  | "sky"
  | "eclipse"
  | "causality";

export const publicNavigation = [
  { href: "/", label: "Main" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/jobs", label: "Jobs" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
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
