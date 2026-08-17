import type { KnowledgeEntry } from "./model";

type SeedDocument = Omit<KnowledgeEntry, "revision" | "publishedRevision" | "updatedBy" | "updatedAt">;

const shared = {
  spaceKey: "sdk-docs" as const,
  versionLabel: "0.x / development",
  publicationStatus: "published" as const,
};

export const sdkDocuments: readonly SeedDocument[] = [
  {
    ...shared,
    id: "docs-threshold-overview", slug: "overview", parentSlug: null, productKey: "threshold", entryType: "overview", navOrder: 10,
    title: "Threshold overview", summary: "The rendering system, its capability boundaries, and how to evaluate it.",
    body: `## What Threshold owns
Threshold is VASTFRAME's high-fidelity rendering system. It brings shadow filtering, lighting acquisition, material response, geometry detail, reflection, water, reconstruction, physically based atmosphere, clouds, and celestial presentation into one production surface.

> Development documentation: Threshold is pre-1.0. Public contracts and supported combinations may change as validation closes.

## Capability map
- Shadow architecture: PCSS, cached shadows, indirect and contact shadowing, and ray-traced paths.
- Lighting: GTAO, probe and APV acquisition, directional lightmap specular, local analytic GI, and shadowed area lights.
- Materials: high-fidelity BRDF response, preintegrated subsurface scattering, and a toon-shading path.
- Surfaces: GPU tessellation, water, screen-space reflection, and analytic reflection fallback.
- Reconstruction: integration paths for DLSS, FSR, and STP.
- Atmosphere: physically based sky, aerial perspective, celestial bodies, and Milky Way presentation.
- Clouds and phenomena: dynamically lit six-directional cloud sequences, aurora, and distant lightning.

## Evaluation order
Start with the shadow architecture, then verify lighting continuity, material response, reflection fallback, and reconstruction behavior in the target production profile. Each capability page will grow alongside validated examples and capture evidence.`,
  },
  {
    ...shared,
    id: "docs-threshold-shadows", slug: "shadow-architecture", parentSlug: "overview", productKey: "threshold", entryType: "concept", navOrder: 20,
    title: "Shadow architecture", summary: "How Threshold organizes soft, cached, indirect, contact, and ray-traced shadow paths.",
    body: `## One authored lighting decision
Threshold treats the selected shadow path as part of a light's production intent. Soft-map filtering, cached updates, contact grounding, indirect contributors, and hardware ray tracing solve different distance and fidelity problems.

## PCSS
Percentage-closer soft shadows vary penumbra width with blocker and receiver geometry. Evaluation should include directional, spot, point, and area-light cases rather than a single hero light.

## Caching
Shadow caching is valuable only when invalidation is trustworthy. Static-caster state, light movement, projection changes, and material deformation all participate in whether a cached result remains valid.

## Contact and indirect response
Contact shadows supply near-field grounding where map resolution is insufficient. Indirect shadow contributors carry authored visibility into probe and baked-lighting paths.

## Validation checklist
- Compare hard, filtered, and PCSS paths at identical exposure.
- Test near and distant receivers.
- Force every invalidation cause used by the target game.
- Inspect temporal stability during camera and light motion.`,
  },
  {
    ...shared,
    id: "docs-threshold-lighting", slug: "lighting-materials-and-reflections", parentSlug: "overview", productKey: "threshold", entryType: "guide", navOrder: 30,
    title: "Lighting, materials, and reflections", summary: "A practical map of Threshold's spatial lighting and surface-response layers.",
    body: `## Spatial lighting
Probe data, Adaptive Probe Volumes, baked directional response, analytic local GI, and ambient occlusion contribute at different spatial scales. A production scene should make their handoffs visible before art content hides them.

## Material response
The material path is evaluated as a complete lighting surface: direct BRDF response, directional specular, subsurface transport, ambient visibility, and reflection composition.

## Reflection hierarchy
Screen-space reflection supplies view-local detail. Analytic reflection paths provide controlled fallback where screen data is unavailable. Water combines the same hierarchy with a moving, tessellated surface.

## Reconstruction
DLSS, FSR, and STP integrations must be evaluated with the exact motion-vector, transparency, reflection, and post-processing configuration used by the game. The existence of an integration is not a substitute for a production-profile test.`,
  },
  {
    ...shared,
    id: "docs-threshold-atmosphere-overview", slug: "atmosphere-and-sky", parentSlug: "overview", productKey: "threshold", entryType: "overview", navOrder: 40,
    title: "Atmosphere and sky", summary: "Physical atmosphere, celestial presentation, cloud sequences, and distant phenomena inside Threshold.",
    body: `## A continuous rendering system
Threshold renders the world above and beyond the playable space: physically based atmosphere, celestial bodies, the Milky Way, dynamically lit cloud sequences, aurora, and distant lightning.

Sky presentation remains continuous with the lighting and exposure of the world beneath it. Atmosphere, clouds, and celestial light are evaluated as part of Threshold rather than as unrelated background layers.

## Capability map
- Physically based sky and aerial perspective.
- Sun, moon, celestial bodies, and Milky Way presentation.
- Fast six-directional cloud sequences with dynamic lighting.
- Aurora borealis and distant lightning phenomena.`,
  },
  {
    ...shared,
    id: "docs-threshold-atmosphere", slug: "atmosphere-and-celestial-field", parentSlug: "atmosphere-and-sky", productKey: "threshold", entryType: "concept", navOrder: 50,
    title: "Atmosphere and celestial field", summary: "The relationship between atmospheric depth, time, light direction, and astronomical presentation in Threshold.",
    body: `## Atmospheric continuity
The useful test is not a perfect clear noon. Evaluate sunrise, high noon, dusk, night, high altitude, and long-distance silhouettes under one exposure strategy.

## Celestial presentation
Sun, moon, stars, and the Milky Way must retain plausible hierarchy without preventing art direction. Celestial direction can inform world lighting while presentation remains independently controllable.

## Evaluation checklist
- Inspect horizon transitions at several elevations.
- Test bright and dark adaptation ranges.
- Verify moon and star visibility against cloud and atmospheric extinction.
- Confirm that time progression does not introduce discontinuities.`,
  },
  {
    ...shared,
    id: "docs-threshold-phenomena", slug: "clouds-and-distant-phenomena", parentSlug: "atmosphere-and-sky", productKey: "threshold", entryType: "guide", navOrder: 60,
    title: "Clouds and distant phenomena", summary: "Production use of six-directional cloud data, aurora, and distant lightning.",
    body: `## Six-directional cloud sequences
Six-directional data allows a prepared cloud sequence to respond quickly to changing illumination. Evaluate sequence cadence, directional-light changes, self-shadowing, and transitions between authored states.

## Aurora
Aurora should read as a volumetric-scale event while remaining controllable enough to serve composition and gameplay readability.

## Distant lightning
Distant lightning is an atmospheric illumination event before it is a visible bolt. The buildup, cloud response, silhouette, and decay are all part of the authored result.`,
  },
  {
    ...shared,
    id: "docs-eclipse-overview", slug: "overview", parentSlug: null, productKey: "eclipse", entryType: "overview", navOrder: 10,
    title: "Eclipse overview", summary: "Scene preparation, lightmapping, UV packing, hidden-surface removal, and area streaming.",
    body: `## What Eclipse owns
Eclipse is the production scene pipeline. It prepares authored spaces for dependable lighting, geometry use, visibility, and streaming.

> Development documentation: Eclipse is pre-1.0. Backend and workflow details remain subject to validation.

## Capability map
- Deterministic scene-processing passes.
- Lightmapping and directional bake data.
- UV packing and texel allocation.
- Hidden-surface removal.
- Area streaming and spatial organization.

## Design principle
Pipeline work is successful when expensive decisions become repeatable, inspectable outputs rather than undocumented editor ritual.`,
  },
  {
    ...shared,
    id: "docs-eclipse-baking", slug: "lightmapping-and-uv-packing", parentSlug: "overview", productKey: "eclipse", entryType: "guide", navOrder: 20,
    title: "Lightmapping and UV packing", summary: "How Eclipse approaches directional bake output, atlas use, and production iteration.",
    body: `## Bake output
Eclipse treats baked lighting as production data with explicit inputs, diagnostics, and reproducible output. Directional response matters because materials continue to react after direct lighting is baked.

## UV packing
Packing quality is measured through usable texel allocation, stable padding, predictable scale, and clear reporting of problematic geometry.

## Production checks
- Compare clean and incrementally rebuilt output.
- Inspect atlas utilization and padding.
- Validate directional response on representative materials.
- Record the scene, settings, and backend used for every accepted result.`,
  },
  {
    ...shared,
    id: "docs-eclipse-streaming", slug: "visibility-and-area-streaming", parentSlug: "overview", productKey: "eclipse", entryType: "concept", navOrder: 30,
    title: "Visibility and area streaming", summary: "Preparing large worlds by removing hidden work and organizing spatial residency.",
    body: `## Hidden-surface removal
Geometry that cannot contribute to a supported view can be removed from downstream work, but the removal policy must remain inspectable and reversible during production.

## Area streaming
Streaming regions describe what is resident, warming, and dormant around a traversal path. Boundaries should reflect gameplay visibility and traversal rather than arbitrary grid size alone.

## Evaluate together
Visibility preparation, lighting data, and streaming residency affect one another. A useful validation scene exercises their boundaries in combination.`,
  },
  {
    ...shared,
    id: "docs-causality-overview", slug: "overview", parentSlug: null, productKey: "causality", entryType: "overview", navOrder: 10,
    title: "Causality overview", summary: "Energy, fire, air, surfaces, interaction, and destruction as a connected simulation.",
    body: `## What Causality owns
Causality coordinates world changes that should influence one another: electrical energy, ignition and fire, air and surface state, NPC interaction, and physics destruction.

> Development documentation: Causality is pre-1.0. Simulation authority, profiles, and performance envelopes will continue to evolve.

## Design principle
The system records causes and applies bounded effects. A convincing chain reaction remains explainable, authorable, and testable.

## Capability map
- Electric arcs and conductive paths.
- Fire, heat, ignition, and material response.
- Surface and air simulation.
- NPC interaction and physics destruction.`,
  },
  {
    ...shared,
    id: "docs-causality-energy", slug: "energy-fire-and-propagation", parentSlug: "overview", productKey: "causality", entryType: "concept", navOrder: 20,
    title: "Energy, fire, and propagation", summary: "How electrical and thermal events become bounded, material-aware world changes.",
    body: `## Electric arcs
Arc simulation resolves eligible conductive paths, contacts, and energy limits. Visual branching should communicate the same path the gameplay simulation selected.

## Ignition and fire
Ignition is a state transition driven by heat, material response, and exposure. Propagation remains bounded by the configured simulation surface and production profile.

## Chain-reaction checks
- Record the initial cause separately from derived effects.
- Verify deterministic authority where gameplay depends on the result.
- Bound work under worst-case connected scenes.
- Preserve readable aftermath rather than resetting immediately after the effect.`,
  },
  {
    ...shared,
    id: "docs-causality-world", slug: "air-surfaces-and-interaction", parentSlug: "overview", productKey: "causality", entryType: "guide", navOrder: 30,
    title: "Air, surfaces, and interaction", summary: "Connecting environmental state to NPC decisions and persistent physical change.",
    body: `## Environmental fields
Air and surface representations carry different information and cost. Their resolution and update cadence should follow the gameplay question being asked.

## NPC interaction
Characters consume meaningful outputs—hazard, obstruction, temperature, visibility, or affordance—rather than depending on a visual effect alone.

## Destruction
Physics destruction participates in the same causal record. Changed geometry can alter traversal, airflow, conductive paths, visibility, and future simulation events.`,
  },
] as const;

export const documentationProducts = ["threshold", "eclipse", "causality"] as const;

export function documentsForProduct(productKey: string) {
  return sdkDocuments.filter((document) => document.productKey === productKey).sort((a, b) => a.navOrder - b.navOrder);
}

export function findSdkDocument(productKey: string, slug = "overview") {
  return sdkDocuments.find((document) => document.productKey === productKey && document.slug === slug);
}

export function searchSdkDocuments(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return sdkDocuments.filter((document) => {
    const haystack = `${document.title} ${document.summary} ${document.body} ${document.productKey}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
