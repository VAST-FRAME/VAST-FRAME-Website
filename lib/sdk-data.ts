import type { MediaTone } from "./site-data";

export type ShowcaseMedia = {
  slot: string;
  ratio: string;
  tone: MediaTone;
  title: string;
  direction: string;
  size: "wide" | "half" | "portrait" | "square";
};

export type SdkProduct = {
  index: string;
  slug: "threshold" | "atrium" | "eclipse" | "causality";
  name: string;
  description: string;
  statement: string;
  capabilities: ReadonlyArray<{ title: string; items: readonly string[] }>;
  media: readonly ShowcaseMedia[];
};

export const sdkProducts: readonly SdkProduct[] = [
  {
    index: "01",
    slug: "threshold",
    name: "Threshold",
    description: "A high-fidelity renderer for authored light, responsive materials, reflection, geometry, and spatial depth.",
    statement: "Make every light source, surface, and shadow carry its weight.",
    capabilities: [
      { title: "Shadow architecture", items: ["PCSS shadows", "Shadow caching", "Indirect and contact shadows", "Ray-traced shadow paths"] },
      { title: "Lighting and GI", items: ["GTAO", "Light probes and APV", "Directional lightmap specular", "Analytic local GI", "Shadowed area lights"] },
      { title: "Materials and geometry", items: ["High-fidelity BRDF shading", "Preintegrated subsurface scattering", "GPU tessellation", "Toon-shading path"] },
      { title: "Surfaces and reconstruction", items: ["Water rendering", "Screen-space and analytic reflections", "DLSS, FSR, and STP integration"] },
    ],
    media: [
      { slot: "THRESHOLD_SHADOW_ARCHITECTURE_HERO", ratio: "21 / 9", tone: "checker", title: "A single scene carrying every shadow path", direction: "Wide architectural frame: hard-to-soft PCSS transitions, cached distance shadows, contact grounding, and a ray-traced hero shadow.", size: "wide" },
      { slot: "THRESHOLD_AREA_LIGHT_VOLUME", ratio: "4 / 5", tone: "threshold", title: "Area light volume study", direction: "Vertical interior composition with several shaped emitters, visible penumbra variation, and glossy response.", size: "portrait" },
      { slot: "THRESHOLD_MATERIAL_SSS_CLOSEUP", ratio: "1 / 1", tone: "neutral", title: "Material response under pressure", direction: "Macro comparison of BRDF lobes and preintegrated SSS on production materials.", size: "square" },
      { slot: "THRESHOLD_WATER_REFLECTION_CORRIDOR", ratio: "16 / 10", tone: "neutral", title: "Water and layered reflection", direction: "Low camera across moving water combining SSR, analytic fallback, tessellated surface detail, and shadowed lighting.", size: "half" },
      { slot: "THRESHOLD_GI_PROBE_TRANSITION", ratio: "3 / 2", tone: "checker", title: "Lighting through a changing space", direction: "Indoor-to-outdoor path showing APV, light probes, GTAO, and analytic local GI continuity.", size: "half" },
      { slot: "THRESHOLD_RECONSTRUCTION_COMPARISON", ratio: "21 / 9", tone: "threshold", title: "Reconstruction paths, matched frame", direction: "Three-panel crop prepared for native, DLSS/FSR, and STP comparison at identical camera and exposure.", size: "wide" },
    ],
  },
  {
    index: "02",
    slug: "atrium",
    name: "Atrium",
    description: "A physically based atmosphere and celestial renderer for skies that behave like part of the world.",
    statement: "The world does not stop at the horizon.",
    capabilities: [
      { title: "Atmosphere", items: ["Physically based sky rendering", "Aerial perspective", "Continuous time-of-day response"] },
      { title: "Celestial field", items: ["Sun, moon, and celestial bodies", "Milky Way rendering", "Astronomical light direction"] },
      { title: "Cloud sequences", items: ["Fast six-directional cloud data", "Dynamic lighting", "Production-friendly sequence playback"] },
      { title: "Distant phenomena", items: ["Aurora borealis", "Distant lightning", "Weather-scale visual events"] },
    ],
    media: [
      { slot: "ATRIUM_ATMOSPHERE_HERO", ratio: "21 / 9", tone: "atrium", title: "Atmosphere from ground to orbit", direction: "Extreme-wide horizon with layered aerial perspective, a low sun, cloud silhouettes, and visible celestial depth.", size: "wide" },
      { slot: "ATRIUM_CELESTIAL_NIGHT_FIELD", ratio: "3 / 2", tone: "checker", title: "Celestial night field", direction: "Night exposure balancing the Milky Way, moonlight, stars, and grounded landscape values.", size: "half" },
      { slot: "ATRIUM_SIX_DIRECTION_CLOUD_LIGHTING", ratio: "4 / 5", tone: "neutral", title: "Cloud sequence under changing light", direction: "Tall cloud formation with directional-light study markers and a clear read on self-shadowing.", size: "portrait" },
      { slot: "ATRIUM_AURORA_WEATHER_EVENT", ratio: "1 / 1", tone: "atrium", title: "Aurora as a world event", direction: "Square environmental frame pairing aurora curtains with reflective terrain and readable atmospheric falloff.", size: "square" },
      { slot: "ATRIUM_DISTANT_LIGHTNING_TIMELINE", ratio: "21 / 8", tone: "checker", title: "Distant lightning sequence", direction: "Four-beat panoramic sequence showing buildup, illumination, strike silhouette, and atmospheric decay.", size: "wide" },
    ],
  },
  {
    index: "03",
    slug: "eclipse",
    name: "Eclipse",
    description: "Production infrastructure for baking, visibility, packing, and streaming large authored spaces.",
    statement: "Build the scene once. Let the pipeline carry it.",
    capabilities: [
      { title: "Scene preparation", items: ["Scene processing pipeline", "Deterministic production passes", "Validation-oriented outputs"] },
      { title: "Lighting production", items: ["Integrated lightmapper", "Directional bake data", "Iteration-focused bake workflow"] },
      { title: "Geometry preparation", items: ["UV packing", "Stable texel allocation", "Hidden-surface removal"] },
      { title: "World scale", items: ["Area streaming", "Spatial partitioning", "Production-scale scene organization"] },
    ],
    media: [
      { slot: "ECLIPSE_SCENE_PIPELINE_HERO", ratio: "21 / 9", tone: "checker", title: "A world moving through the pipeline", direction: "Panoramic editor view with scene regions, bake state, visibility state, and streaming boundaries composed as one production frame.", size: "wide" },
      { slot: "ECLIPSE_LIGHTMAP_DIRECTIONAL_RESULT", ratio: "3 / 2", tone: "neutral", title: "Directional bake result", direction: "Final lit environment beside compact diagnostic overlays for directionality and texel use.", size: "half" },
      { slot: "ECLIPSE_UV_PACKING_INSPECTION", ratio: "1 / 1", tone: "eclipse", title: "UV packing inspection", direction: "Dense but legible atlas with utilization, padding, and problem-island callouts.", size: "square" },
      { slot: "ECLIPSE_HSR_CUTAWAY", ratio: "4 / 5", tone: "neutral", title: "Hidden-surface removal cutaway", direction: "Vertical exploded building showing retained shell geometry and removed occluded surfaces.", size: "portrait" },
      { slot: "ECLIPSE_STREAMING_REGION_MAP", ratio: "21 / 8", tone: "eclipse", title: "Area streaming at world scale", direction: "Long-form topographic view of loaded, warming, and dormant regions around a player path.", size: "wide" },
    ],
  },
  {
    index: "04",
    slug: "causality",
    name: "Causality",
    description: "A systemic simulation framework for energy, fire, air, surfaces, objects, and characters.",
    statement: "A world is convincing when one change can become another.",
    capabilities: [
      { title: "Energy", items: ["Electric arc simulation", "Conductive path response", "Energy-driven interactions"] },
      { title: "Fire", items: ["Fire propagation", "Material-aware response", "Heat and ignition state"] },
      { title: "Environment", items: ["Surface simulation", "Air simulation", "Cross-system influence"] },
      { title: "Interaction", items: ["NPC interaction", "Physics destruction", "Chain-reaction authoring"] },
    ],
    media: [
      { slot: "CAUSALITY_CHAIN_REACTION_HERO", ratio: "21 / 9", tone: "neutral", title: "One event becoming another", direction: "Wide readable chain: electrical fault, ignition, air movement, NPC response, and structural failure across one space.", size: "wide" },
      { slot: "CAUSALITY_ELECTRIC_ARC_NETWORK", ratio: "4 / 5", tone: "causality", title: "Electric arc network", direction: "Vertical machinery stack with branching conductive paths, contact points, and energy falloff.", size: "portrait" },
      { slot: "CAUSALITY_FIRE_SURFACE_PROPAGATION", ratio: "3 / 2", tone: "checker", title: "Fire reading the surface", direction: "Material transition study showing ignition, spread rate, residue, and influence zones.", size: "half" },
      { slot: "CAUSALITY_AIR_SIMULATION_SLICE", ratio: "1 / 1", tone: "neutral", title: "Air simulation slice", direction: "Diagnostic volume through a room visualizing flow, heat, and obstruction without losing the environment.", size: "square" },
      { slot: "CAUSALITY_NPC_SYSTEMIC_RESPONSE", ratio: "16 / 10", tone: "causality", title: "NPC response to a changing world", direction: "Gameplay-width composition of perception, avoidance, and interaction triggered by the same simulated event.", size: "half" },
      { slot: "CAUSALITY_DESTRUCTION_SEQUENCE", ratio: "21 / 8", tone: "checker", title: "Destruction with history", direction: "Four-stage sequence from intact structure through stress, fracture, and persistent aftermath.", size: "wide" },
    ],
  },
] as const;

export function getSdkProduct(slug: string): SdkProduct | undefined {
  return sdkProducts.find((product) => product.slug === slug);
}
