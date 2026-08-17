export type CommercialProductKey = "threshold" | "eclipse" | "causality" | "mesh-graph";

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
    description: "High-fidelity authored lighting, materials, reflection, geometry, atmosphere, and celestial rendering.",
    availability: "development",
    studioPriceUsd: 3799,
    priceLabel: "Studio $3,799 / Enterprise contact",
  },
  {
    key: "eclipse",
    name: "Eclipse",
    description: "Scene processing, baking, UV preparation, visibility, packing, and area streaming.",
    availability: "development",
    studioPriceUsd: 1399,
    priceLabel: "Studio $1,399 / Enterprise contact",
  },
  {
    key: "causality",
    name: "Causality",
    description: "Systemic simulation for energy, fire, air, surfaces, objects, and characters.",
    availability: "development",
    studioPriceUsd: 1399,
    priceLabel: "Studio $1,399 / Enterprise contact",
  },
] as const;

export const licenseTerms = {
  titleAllowance: "One commercial title",
  term: "Perpetual use",
  updateWindow: "Two years of updates",
} as const;
