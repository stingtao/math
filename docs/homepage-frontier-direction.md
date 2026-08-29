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
- All visible CSS type remains within 16–34px; hierarchy comes from composition, density, contrast, and whitespace.
- Motion uses opacity and transform, remains subtle, and stops under `prefers-reduced-motion`.
- Public world selection stays in memory only; it adds no identity, cookie, local storage, or tracking.

## Generated art assets and final prompts

Mode: built-in `image_gen`, using style transfer from the original world compositions.

Shared visual contract: clean contemporary graphic-novel art for American high school students; confident dark-navy linework, flat color blocks, minimal cel shading, simplified backgrounds, and generous quiet space for HTML copy. Preserve the subject and composition of the reference image. Do not add words, logos, UI, equations, watermarks, photorealism, glossy 3D rendering, noisy gradients, or decorative clutter.

### Mars Command

Asset: `public/visuals/frontier-mars-comic-v2.webp`

Prompt: “Apply the shared graphic-novel contract. Keep the teen explorers looking from the ridge toward the Mars settlement, its rover route, domes, and open sky. Use restrained terracotta, coral, sand, navy, and teal color blocks. Make the destination bold and readable at a glance.”

### Deepglass City

Asset: `public/visuals/frontier-deepglass-comic-v2.webp`

Prompt: “Apply the shared graphic-novel contract. Keep the teen explorers in the observation tunnel facing the underwater city, manta ray, current routes, and geometric architecture. Use deep ocean navy, turquoise, aqua, and restrained coral accents.”

### Aurora Wilds

Asset: `public/visuals/frontier-aurora-comic-v2.webp`

Prompt: “Apply the shared graphic-novel contract. Keep the explorers on the dark ridge approaching the crystal signal, route nodes, and aurora wilderness. Use ink navy, violet, mint, lavender, and small amber accents.”

### World atlas

Asset: `public/visuals/theme-worlds-atlas-comic-v2.webp`

Prompt: “Apply the shared graphic-novel contract to exactly five equal vertical panels: abstract geometry, Mars exploration, a bright future city garden, an underwater city, and an aurora wilderness. Give each panel one clear focal point and a restrained matching palette; keep the full strip calm enough to sit behind interface copy.”

## Future iteration hooks

- Connect each world to its own Grade 7–9 interactive mission set.
- Let completed bosses visibly construct or restore a piece of the selected world.
- Add world-specific badge families and expedition events without changing scoring fairness.
- Test which world produces the strongest first-mission start rate and completion rate, using anonymous aggregate events only if privacy review approves them.
- Keep the fixed brand line while rotating world objectives, mission previews, and seasonal destinations.
