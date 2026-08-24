# Badge Quest System — Requirement Intake

## Requirement Summary

- Raw request — **confirmed:** create levels and a 500-badge collection; award one lesson badge when a lesson is first completed; award one answer badge for every ten qualified correct answers; provide a collection home; make unlocks feel prestigious and game-like; substantially strengthen correct-answer animation.
- Business intent — **confirmed:** make steady Grade 7–9 learning feel collectible, visible, and worth returning to without adding pressure or paid/random rewards.
- Player outcome — **confirmed:** every completed lesson leaves a permanent visual trophy, every ten real corrections advances a long-term answer quest, and a new badge produces a memorable but skippable celebration.
- Scope interpretation — **inferred:** “course badge” means one badge for each of the existing 124 short lessons. The remaining 376 badges form the ten-correct-answer quest, producing exactly 500 deterministic badges.

## Track Breakdown

### ui-ux

- Status: `required`
- Add a signed-in Badge Vault route and navigation entry.
- Show collection total, recent unlocks, next ten-answer milestone, filters, locked silhouettes, and a progressively revealed gallery.
- Add a full-screen badge reveal with a visible Skip/Continue action, reduced-motion support, and no information conveyed by color alone.
- Upgrade ordinary correct-answer feedback with a larger impact layer, charge meter, number burst, and stronger chain states.
- Constraint: mobile must keep a clear primary action and avoid rendering all 500 cards at once.

### feature-logic

- Status: `required`
- Generate versioned catalog `2026.1`: exactly 124 lesson badges plus 376 answer-quest badges.
- Grant a lesson badge only on the first saved lesson completion.
- Grant the next answer badge whenever the server-authoritative qualified-correct count reaches a multiple of ten.
- Count one credit per unique lesson run/question, review day/question, Boss attempt/question, or repair step; duplicate requests do not count twice.
- Cosmetic badges never add leaderboard XP and cannot be bought or opened from a random box.

### backend-authority

- Status: `required`
- Perform all signed-in badge grants on the server and return only newly inserted unlocks.
- Reuse mutation idempotency plus unique credit keys and database primary keys.
- Repair any missed lower ten-answer milestone during the next valid credit, so concurrent requests cannot skip a badge.
- Return collection summary in private learner state; do not expose badge ownership publicly.

### database-persistence

- Status: `required`
- Add `badge_unlocks` keyed by learner and badge.
- Add `answer_credits` keyed by learner and qualified-answer credit key.
- Cascade both tables when the anonymous learner account is deleted.
- Keep badge catalog definitions in versioned code; persist only ownership and credit events.

### validation-ops

- Status: `required`
- Assert an exact 500-item catalog, unique IDs/titles, 124 lesson mappings, and 376 ten-answer thresholds.
- Test duplicate-credit safety, first-completion semantics, private-state shape, migration/bootstrap parity, reduced motion, mobile touch targets, and progressive rendering.
- Run lint, curriculum property checks, production build, Wrangler dry-run, deploy, and HTTP smoke tests.

### research

- Status: `n/a`
- No external economy, pricing, or legal research is required. The system preserves the existing 13+ limit, anonymity model, and no-random-loot rule.

### risks-dependencies

- Status: `required`
- Avoid 500 raster assets and 500-card initial DOM cost; use deterministic SVG/CSS medallions and progressive reveal.
- Avoid farming by qualifying a source event once; replay practice may count once per valid new run because practicing again is the intended behavior.
- Keep strong motion time-bounded, dismissible, non-blocking after Continue, and disabled by `prefers-reduced-motion`.

## Backlog Routing

- Current delivery: catalog, persistence, lesson/review/Boss credits, Badge Vault, navigation, reveal overlay, correct-answer impact, tests, migration, and deployment.
- Deferred follow-up: optional badge pinning to the anonymous avatar, seasonal collections, sound/haptics, and teacher-facing badge views. These are separate features and are not required for the requested player outcome.
- Existing systems retained: six private landmark achievements, lesson stars, XP, Trail Tokens, and avatar frames remain distinct and continue to work.

## Execution Readiness

- Clear now: exact catalog composition, unlock rules, storage model, player-facing collection location, privacy boundary, and feedback hierarchy.
- Remaining research: none blocking.
- Recommended next gate: implement the vertical slice, validate server authority and mobile rendering, then run a production release check.

## Player Moment

- Player type: a Grade 7–9 learner completing a short lesson or correcting a practice question.
- Current goal: understand one next step, see immediate proof that it counted, and know what collectible progress moved.
- Why the Badge Vault exists: it converts invisible long-term practice into a private, browsable record without publishing performance history.

## Flow And Screen Structure

- Entry state: the header shows the private badge count; Badge Vault opens to collection progress, the next ten-answer target, and recent trophies.
- During an answer: the prompt remains primary; a correct answer triggers a short impact burst, advances the charge, and reveals a badge only at a ten-answer boundary.
- After a lesson: the settlement first confirms completion, then presents the new lesson badge as the durable trophy.
- Primary CTA on reveal: `Add to my vault` closes the overlay and returns the player to the normal next action.
- Supporting actions: `View Badge Vault` in a new tab, filters, `Show more`, and an always-visible `Skip animation` control.
- Failure/blocked state: incorrect answers use recovery language and do not remove badges or collection progress; locked badges explain their exact requirement.

## Necessary Information

- Immediate: what was earned, why it was earned, collection count, and next action.
- Secondary: badge number, series, rarity, unlock date, and locked catalog details.
- Hidden until requested: the full 500-item gallery beyond the first page and older unlock history.

## UX Findings

- Confusion risk: mixing legacy landmarks with the 500 badges. Mitigation: landmarks remain on Profile; Badge Vault is the collectible system.
- Friction risk: interrupting every correct answer. Mitigation: ordinary answers get a sub-second impact; only actual badge unlocks open the larger reveal.
- Performance risk: 500 visual cards on mobile. Mitigation: filters and progressive batches.
- Accessibility risk: intense motion. Mitigation: semantic status text, Skip/Continue, reduced-motion CSS, and no score information encoded only in animation.

## Recommendations

- Keep: low-pressure correction model, private identity, fair XP, and permanent progress.
- Change: correct answers become tactile visual events; lesson settlement includes a permanent badge trophy; Profile/header link to the Vault.
- Remove: silent collection changes and generic one-size-fits-all success feedback.
- Defer: audio, vibration, sharing, trading, paid cosmetics, random packs, and public badge history.
