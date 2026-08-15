export type MediaTone = "neutral" | "turquoise" | "checker";

export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/jobs", label: "Jobs" },
  { href: "/contact", label: "Contact" },
] as const;

export const sdkNavigation = [
  { href: "/sdk", label: "Overview" },
  { href: "/sdk/threshold", label: "Threshold" },
  { href: "/sdk/atrium", label: "Atrium" },
  { href: "/sdk/eclipse", label: "Eclipse" },
  { href: "/sdk/causality", label: "Causality" },
  { href: "/docs", label: "Documentation" },
] as const;

export const splinterheart = {
  name: "Splinterheart",
  slug: "splinterheart",
  status: "In development",
  platform: "To be announced",
  statement:
    "A new game from VASTFRAME. We are keeping its shape close until it is ready to be seen.",
};

export { sdkProducts } from "./sdk-data";
