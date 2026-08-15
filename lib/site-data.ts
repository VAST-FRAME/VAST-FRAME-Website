export type MediaTone = "neutral" | "pink" | "checker";

export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/sdk", label: "SDK" },
  { href: "/docs", label: "Docs" },
  { href: "/jobs", label: "Jobs" },
  { href: "/contact", label: "Contact" },
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
