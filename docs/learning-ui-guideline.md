# Learning UI guideline

The learner should understand the math, the current task, and the next action without first decoding the product interface.

## 1. Let visuals teach

- Every instructional visual must show a specific mathematical relationship.
- Do not place generic narration such as “Start with the picture” or “Notice what changes” above an image.
- If the visual is unclear, improve the visual with values, arrows, contrast, or a callout attached to the exact object being explained.
- Visible text should add mathematical information that is not already visible. Accessible alternative text remains required.

This follows the multimedia-learning coherence, redundancy, signaling, and contiguity findings: remove nonessential information, cue the essential relationship, and keep explanatory labels near what they explain. References: [multimedia learning review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7940870/), [redundancy review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10192876/), [split-attention and redundancy research](https://doi.org/10.1002/%28SICI%291099-0720%28199908%2913%3A4%3C351%3A%3AAID-ACP589%3E3.0.CO%3B2-6).

## 2. Show one progress truth

For one bounded task, show one persistent progress indicator using familiar language: `3 of 5 complete`.

- Question position and completion belong in one compact progress area.
- Correct-answer streaks are transient answer feedback, not permanent cards.
- Stars and rewards appear at completion, when they become outcomes.
- A second progress surface is allowed only when it measures a different scope or time horizon and changes the learner’s decision.

A clear step indicator exists to update users on progress through a multi-step process; its labels should describe that process directly. References: [U.S. Web Design System step indicator](https://designsystem.digital.gov/components/step-indicator/), [W3C clear labels](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p06-clear-labels/).

## 3. Game style supports meaning

Game styling may add color, motion, delight, and celebration. It must not rename ordinary concepts.

- Prefer `Progress`, `Correct`, `2 in a row`, `Try again`, and `Next badge`.
- Avoid `Charge`, `Path`, `Chain`, `Pulse`, `Signal`, and `Lock` when they only mean progress or consecutive correct answers.
- Lore can decorate a clear label, but never replace it.

## 4. Diagnose the assembled page

The common failure is additive gamification: each new feature adds a heading, metric, card, and animation without removing the older signal. Components may look reasonable alone but become a manual when stacked.

For every page:

1. List every task, visual, counter, progress surface, reward, and CTA.
2. State what each visual teaches.
3. Map each progress surface to position, completion, accuracy, retry, streak, reward, or mastery.
4. Collapse items that represent the same task, scope, and time horizon.
5. Keep corrective hints, meaningful math labels, errors, accessibility, privacy, safety, and legal information.
6. Verify desktop and mobile layouts, keyboard behavior, reduced motion, text wrapping, and the 16–34 px type contract.
