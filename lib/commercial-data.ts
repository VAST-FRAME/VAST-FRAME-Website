export type CommercialProductKey = "threshold" | "atrium" | "eclipse" | "causality" | "mesh-graph";

export type CommercialProduct = {
  key: CommercialProductKey;
  name: string;
  description: string;
  availability: "development" | "available" | "planned";
  priceLabel: string;
};

export const commercialProducts: readonly CommercialProduct[] = [
  {
    key: "threshold",
    name: "Threshold",
    description: "High-fidelity authored lighting, materials, reflection, geometry, and spatial depth.",
    availability: "development",
    priceLabel: "Pricing forthcoming",
  },
  {
    key: "atrium",
    name: "Atrium",
    description: "Physically based atmosphere, celestial rendering, clouds, and distant phenomena.",
    availability: "development",
    priceLabel: "Pricing forthcoming",
  },
  {
    key: "eclipse",
    name: "Eclipse",
    description: "Scene processing, baking, UV preparation, visibility, packing, and area streaming.",
    availability: "development",
    priceLabel: "Pricing forthcoming",
  },
  {
    key: "causality",
    name: "Causality",
    description: "Systemic simulation for energy, fire, air, surfaces, objects, and characters.",
    availability: "development",
    priceLabel: "Pricing forthcoming",
  },
] as const;

export const licenseTerms = {
  releaseAllowance: "One shipped product",
  internalUse: "Unlimited internal use",
  term: "Perpetual license",
  updateWindow: "Two years of updates",
} as const;
