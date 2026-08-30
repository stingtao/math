# Experience progression system

The reward layer should feel exciting on day one and still reveal something new after weeks of use. It must never become louder simply because more time has passed. The system therefore separates four things that can evolve independently:

- **meaning:** `Correct`, `Level up`, `Badge earned`, and `Boss cleared` remain plain and immediately understandable;
- **motion:** particles, rings, trails, timing, and camera-like movement become richer in finite steps;
- **craft:** badge materials progress from ink to bronze, enamel, silver, prism, deepglass, gold, stellar, cosmic, and mythic;
- **story:** a continuous illustrated route moves from base camp to Mars, orbit, the deep ocean, and an aurora archive.

## Player moment and flow

### Correct answer

- Entry: the learner submits one answer.
- Required signal: an immediate check and concise result.
- Celebration: the current experience stage changes particle topology, motif, color layering, and energy.
- Exit: the next-question action remains available and automatically advances after six seconds.
- Failure: wrong answers use correction support, never a punitive version of the spectacle.

### Badge earned

- Entry: a real lesson or answer threshold is crossed.
- Required signal: the badge itself is the visual owner of the moment.
- Celebration: the medallion material reflects its catalog progression; the backdrop uses the learner's current story chapter.
- Exit: the badge visibly travels to the vault; the animation is skippable.

### Level up

- Entry: saved XP crosses a level boundary.
- Required signal: show the new level or rank and retain the readable XP meter.
- Celebration: a finite sweep and orb ascent use the current experience stage.
- Exit: the completion CTA stays primary.

### Boss

- Entry: a region's lessons are complete.
- Required signal: hearts, question position, and the current mathematical connection stay visible.
- Story: the current illustrated expedition chapter becomes the arena establishing shot.
- Victory: Boss clear uses a stronger version of the current stage, then shows the earned outcome and next region.
- Failure: repair remains calm, specific, and recoverable; spectacle returns only after repair or victory.

## Twenty-stage route for the first hundred lesson clears

One stage covers five lesson clears. The renderer reads data rather than stage-specific component branches, so later work can append stages 21–40 or 41–60 without rewriting the answer, badge, XP, or Boss flows.

| Stage | Lessons | Experience | New visual vocabulary | Material | Story chapter |
|---:|---:|---|---|---|---|
| 1 | 0–4 | Trailhead Pulse | ink ripple, clear check | Ink | Base camp |
| 2 | 5–9 | Compass Sparks | star-point particles | Ink | Base camp |
| 3 | 10–14 | Route Ripples | orbiting route rings | Bronze | Base camp |
| 4 | 15–19 | Canyon Lift | upward trail motion | Bronze | Base camp |
| 5 | 20–24 | Bronze Frontier | first crest-like burst | Bronze | Base camp |
| 6 | 25–29 | Rover Streak | long supply-route trails | Enamel | Mars colony |
| 7 | 30–34 | Colony Signal | synchronized ripples | Enamel | Mars colony |
| 8 | 35–39 | Prism Crossing | split-color geometry | Prism | Mars colony |
| 9 | 40–44 | Comet Tails | high-energy light tails | Prism | Mars colony |
| 10 | 45–49 | Silver Orbit | circular observatory halo | Silver | Orbit |
| 11 | 50–54 | Lattice Wake | square proof lattice | Silver | Orbit |
| 12 | 55–59 | Deepglass Bloom | luminous glass bloom | Deepglass | Ocean city |
| 13 | 60–64 | Current Rings | layered current curves | Deepglass | Ocean city |
| 14 | 65–69 | Aurora Sweep | broad aurora trails | Gold | Ocean city |
| 15 | 70–74 | Golden Archive | gold unlock ceremony | Gold | Aurora archive |
| 16 | 75–79 | Eclipse Halo | dark-center rare halo | Stellar | Aurora archive |
| 17 | 80–84 | Nova Shards | angular nova fragments | Stellar | Aurora archive |
| 18 | 85–89 | Constellation Stitch | connected star geometry | Cosmic | Aurora archive |
| 19 | 90–94 | Crown Orbit | double orbit and crown | Cosmic | Aurora archive |
| 20 | 95–100+ | Mythic Portal | full-spectrum portal | Mythic | Aurora archive |

## Content and implementation contract

- The stable input is the number of unique completed lessons. Replays cannot farm higher spectacle.
- A stage adds a new combination of motif, motion family, material, intensity, and story crop. It does not rename `Correct`, `Level up`, `Badge earned`, or `Boss cleared`.
- A new stage appears only at a durable milestone. Correct-answer streaks can amplify the current stage but cannot permanently advance it.
- The first stage must already feel complete. Later stages add novelty and craft, not basic usability that new learners lack.
- Every animation is finite. Badge ceremonies are skippable. `prefers-reduced-motion` removes motion while retaining outcome, hierarchy, color, and saved state.
- The generated story mural is one 1600 × 683 WebP sprite with five crop-safe chapters, keeping network cost bounded while allowing multiple story contexts.
- Badge quality is deterministic from the badge's stable catalog position or answer threshold. The same badge never changes appearance between visits.
- Mobile uses the same stage and information hierarchy with a stacked scene; no horizontal scroll or hover-only meaning is allowed.

## Extension to forty and sixty stages

Append new stage records; do not branch components by milestone number. Every new record must define a unique name, motif, pattern key, motion family, material, intensity, story chapter, and crop position. New art atlases may add chapters without changing prior crop positions. Tests must continue to verify stable five-lesson boundaries, unique stage keys, capped fallback behavior, reduced motion, and accessible outcomes.
