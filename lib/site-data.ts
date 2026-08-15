export type MediaTone = "neutral" | "pink" | "checker";

export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/sdk", label: "SDK" },
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

export const sdkProducts = [
  {
    index: "01",
    name: "Threshold",
    kind: "Renderer",
    description:
      "A high-fidelity renderer for light, material, shadow, atmosphere, reflection, and spatial depth.",
  },
  {
    index: "02",
    name: "Eclipse",
    kind: "Lightmapper",
    description:
      "Lighting bake infrastructure built for rich directional response and dependable production iteration.",
  },
  {
    index: "03",
    name: "Firmament",
    kind: "Physical sky",
    description:
      "Atmosphere, astronomy, celestial light, clouds, and distant phenomena for worlds that feel continuous.",
  },
  {
    index: "04",
    name: "Causality",
    kind: "World simulation",
    description:
      "A systemic simulation framework for environments that influence materials, spaces, objects, and one another.",
  },
] as const;
