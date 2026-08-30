# Question Response Audit

## Scope

The August 2026 review inspected the assembled Grade 7–12 bank after coverage extensions and enrichment: 253 lessons and 1,346 questions.

Before the review, 978 questions used free-form input. The audit found 218 whose intended evidence was a word, phrase, category, property, direction, or explanation. These questions were converted to authored two-, three-, or four-choice interactions. The remaining 760 fill-ins ask the learner to construct a compact number or mathematical expression.

## Decision rule

Use a selectable response when a mathematically correct learner could be rejected because their English differs from an authored string. Typical warning signs include:

- the accepted answer is a concept name or complete phrase;
- aliases contain articles, plurals, hyphens, or several paraphrases;
- the prompt asks what something represents, is called, classifies as, or means;
- the response is a direction, relationship, model family, proof reason, or statistical interpretation.

Keep free response only when producing the numeric value or mathematical notation is part of the objective and at least one compact accepted form can be normalized reliably. A numeric or symbolic alternative may make a response safe even when another accepted alias is written in words.

## Implementation contract

`lib/curriculum-response-upgrades.ts` stores the reviewed question keys and authored distractors. It preserves every existing lesson and question ID, then upgrades the assembled curriculum so lesson, Boss, and review surfaces all receive the same interaction.

The curriculum validator enforces three invariants:

1. all 218 reviewed keys still resolve to selectable questions;
2. every remaining fill-in has a constructible numeric or symbolic accepted form;
3. every choice set contains exactly one accepted answer, unique parallel options, and a supported shared renderer.

This contract makes a future phrase-sensitive fill-in fail validation instead of quietly shipping another spelling test.
