export type MediaTone = "neutral" | "turquoise" | "checker";

export const publicNavigation = [
  { href: "/", label: "Main" },
  { href: "/docs", label: "Docs" },
  { href: "/jobs", label: "Jobs" },
  { href: "/contact", label: "Contact" },
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
