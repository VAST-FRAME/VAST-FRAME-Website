export type CommercialProductKey = "threshold" | "atrium" | "eclipse" | "causality" | "mesh-graph";

export type CommercialProduct = {
  key: CommercialProductKey;
  name: string;
  description: string;
  availability: "development" | "available" | "planned";
  independentPriceUsd: number;
  studioPriceUsd: number;
  priceLabel: string;
};

export const commercialProducts: readonly CommercialProduct[] = [
  {
    key: "threshold",
    name: "Threshold",
    description: "High-fidelity authored lighting, materials, reflection, geometry, and spatial depth.",
    availability: "development",
    independentPriceUsd: 249,
    studioPriceUsd: 899,
    priceLabel: "Independent $249 / Studio $899",
  },
  {
    key: "atrium",
    name: "Atrium",
    description: "Physically based atmosphere, celestial rendering, clouds, and distant phenomena.",
    availability: "development",
    independentPriceUsd: 99,
    studioPriceUsd: 349,
    priceLabel: "Independent $99 / Studio $349",
  },
  {
    key: "eclipse",
    name: "Eclipse",
    description: "Scene processing, baking, UV preparation, visibility, packing, and area streaming.",
    availability: "development",
    independentPriceUsd: 199,
    studioPriceUsd: 699,
    priceLabel: "Independent $199 / Studio $699",
  },
  {
    key: "causality",
    name: "Causality",
    description: "Systemic simulation for energy, fire, air, surfaces, objects, and characters.",
    availability: "development",
    independentPriceUsd: 199,
    studioPriceUsd: 699,
    priceLabel: "Independent $199 / Studio $699",
  },
] as const;

export const licenseTerms = {
  titleAllowance: "One commercial title",
  term: "Perpetual use",
  updateWindow: "Two years of updates",
} as const;
