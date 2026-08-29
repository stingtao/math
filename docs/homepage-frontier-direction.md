# Homepage Frontier direction

This document keeps the August 2026 homepage redesign as a durable reference for future feature and story iterations.

## Brand idea

**Math expands the human frontier.** A lesson is a short mission inside a world that needs the learner's reasoning. The product should feel like an expedition game that happens to produce real math progress—not a worksheet covered in game decorations.

Primary line: **Build the worlds no one has reached yet.**

Core promise: **See an example. Take the controls. Repair the miss. Clear the boss. Somewhere along the way, the math clicks.**

## World system

The public homepage previews the same five story themes used after sign-in. `lib/frontier-worlds.ts` owns public story and mission copy; `lib/themes.ts` remains the source for private learner progression.

- Atlas: chart safe routes through an unfinished world.
- Mars: establish the first lasting human settlement.
- Biosphere: restore a floating ecosystem through growth patterns.
- Deepglass: engineer a city beneath the ocean.
- Aurora: decode a signal beyond the known map.

Each new world should define a concrete human goal, a short mission, the math skills it uses, and one visual destination. A theme must change the story and objective—not only the color palette.

## Learning rhythm

1. See the idea through one clear example.
2. Interact with the representation.
3. Repair a miss with a focused hint and another attempt.
4. Clear a short mixed checkpoint.
5. Bring useful ideas back after 1, 3, 7, and 14 days.

Keep missions inside a 6–8 minute expectation. Corrections can recover points. No single wrong answer should stop a run.

## Visual principles

- Make the destination visually larger than the interface.
- Show capable teen crews from an expedition perspective; avoid childish mascots.
- Put math into routes, structures, patterns, and decisions instead of floating decorative formulas.
- Keep visible text in HTML. Generated art contains no words or UI.
- Only the active hero is eager-loaded. World cards are lazy-loaded and use compressed WebP assets.
- All visible CSS type remains within 14–34px; hierarchy comes from composition, density, contrast, and whitespace.
- Motion uses opacity and transform, remains subtle, and stops under `prefers-reduced-motion`.
- Public world selection stays in memory only; it adds no identity, cookie, local storage, or tracking.

## Generated art assets and final prompts

Mode: built-in `image_gen`.

### Mars Command

Asset: `public/visuals/frontier-mars-v1.webp`

Prompt: “Create a cinematic premium editorial illustration for a math learning adventure homepage, wide landscape 16:9. Scene: a teenage expedition crew viewed from behind on a high observation deck overlooking the first thriving human city on Mars at dawn. Elegant red-orange canyons, pressurized glass habitats, a rover route drawn through the terrain, solar arrays, distant launch tower, subtle geometric and coordinate-grid motifs integrated into architecture (not floating formulas). The mood is ambitious, intelligent, adventurous, credible, and cool for American high school students—not childish, not a school textbook. Visual language: stylized 3D concept art with crisp architectural silhouettes, sophisticated deep navy, rust orange, electric cyan highlights, soft cinematic atmosphere, premium game key art. Leave clean darker negative space at upper left for webpage copy. No text, no logos, no UI, no equations, no watermarks.”

### Deepglass City

Asset: `public/visuals/frontier-deepglass-v1.webp`

Prompt: “Create cinematic premium game key art for a math learning adventure homepage, wide landscape 16:9. Scene: a diverse teenage engineering crew inside a glass observation tunnel overlooking a vast luminous underwater city named Deepglass, built into a deep ocean trench. Huge curved pressure gates, modular towers, bioluminescent gardens, a manta ray gliding above, current-map paths and elegant geometric structure embedded naturally into the city. Feeling: daring, intelligent, mysterious, aspirational, and cool for American high school students; not childish, not cartoon school art. Visual language: polished stylized 3D concept art, deep indigo and teal, aqua light, small coral-orange highlights, cinematic depth, premium strategy adventure game. Leave clean darker negative space at upper left for webpage copy. No text, no logos, no UI, no equations, no watermarks.”

### Aurora Wilds

Asset: `public/visuals/frontier-aurora-v1.webp`

Prompt: “Create cinematic premium game key art for a math learning adventure homepage, wide landscape 16:9. Scene: a diverse teenage exploration crew on a black volcanic ridge at the edge of an unmapped alien wilderness under immense violet-green aurora ribbons. A mysterious geometric signal pulses from a distant crystalline observatory, with glowing path nodes and constellation-like patterns leading beyond the known map. The environment combines dark evergreen forms, obsidian terrain, mist, and otherworldly light. Feeling: bold, mysterious, intelligent, aspirational, cool for American high school students; not fantasy cliché, not childish, not school art. Visual language: polished stylized 3D concept art, charcoal black, deep forest, ultraviolet purple and aurora green, cinematic depth, premium sci-fi exploration game. Leave clean darker negative space at upper left for webpage copy. No text, no logos, no UI, no equations, no watermarks.”

## Future iteration hooks

- Connect each world to its own Grade 7–9 interactive mission set.
- Let completed bosses visibly construct or restore a piece of the selected world.
- Add world-specific badge families and expedition events without changing scoring fairness.
- Test which world produces the strongest first-mission start rate and completion rate, using anonymous aggregate events only if privacy review approves them.
- Keep the fixed brand line while rotating world objectives, mission previews, and seasonal destinations.
