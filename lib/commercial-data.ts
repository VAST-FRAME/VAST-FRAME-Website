export type CommercialProductKey = "threshold" | "atrium" | "eclipse" | "causality" | "mesh-graph";

export type CommercialProduct = {
  key: CommercialProductKey;
  name: string;
  description: string;
  availability: "development" | "available" | "planned";
  studioPriceUsd: number;
  priceLabel: string;
};

export const commercialProducts: readonly CommercialProduct[] = [
  {
    key: "threshold",
    name: "Threshold",
    description: "High-fidelity authored lighting, materials, reflection, geometry, and spatial depth.",
    availability: "development",
    studioPriceUsd: 2799,
    priceLabel: "Studio $2,799 / Enterprise contact",
  },
  {
    key: "atrium",
    name: "Atrium",
    description: "Physically based atmosphere, celestial rendering, clouds, and distant phenomena.",
    availability: "development",
    studioPriceUsd: 799,
    priceLabel: "Studio $799 / Enterprise contact",
  },
  {
    key: "eclipse",
    name: "Eclipse",
    description: "Scene processing, baking, UV preparation, visibility, packing, and area streaming.",
    availability: "development",
    studioPriceUsd: 799,
    priceLabel: "Studio $799 / Enterprise contact",
  },
  {
    key: "causality",
    name: "Causality",
    description: "Systemic simulation for energy, fire, air, surfaces, objects, and characters.",
    availability: "development",
    studioPriceUsd: 799,
    priceLabel: "Studio $799 / Enterprise contact",
  },
] as const;

export const licenseTerms = {
  titleAllowance: "One commercial title",
  term: "Perpetual use",
  updateWindow: "Two years of updates",
} as const;
