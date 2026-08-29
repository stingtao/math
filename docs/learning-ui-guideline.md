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

## 5. Keep secondary state available, not loud

Information that does not change the learner's immediate action should not compete with the question.

- Use a familiar compact icon for secondary status such as a scheduled memory return.
- Reveal the explanation in a hover and keyboard-focus tooltip, and preserve an accessible name.
- Keep actionable information visible: errors, hints needed for the retry, mathematical labels, and the next action must never be hidden behind a tooltip.
- Do not repeat streaks beside a persistent task-progress bar when the answer feedback already celebrates the streak.

## 6. Make answer choices parallel

Choices in one question must compare the same kind of object.

- Use the same semantic type, notation, precision, and unit granularity across every option.
- If the prompt supplies the unit and the task tests only the value, every choice may be a bare value.
- If reading the unit is part of the answer, every choice must include the same unit form: `3 pages per minute`, `4 pages per minute`, `6 pages per minute`, `18 pages per minute`.
- Never let the correct option reveal itself by being the only fully written answer.

Content validation should enforce parallel units whenever the accepted multiple-choice answer contains a written unit.

## 7. Make completion an outcome, not a receipt

A completion screen has one short hierarchy:

1. what the learner completed;
2. what they earned;
3. what unlocked or comes next;
4. one dominant next-action CTA.

Keep a secondary map or stop action as a quiet link. Show a newly earned badge or achievement when it actually occurs. Remove separate route-update cards, key inventories, mastery essays, reward receipts, saved-best explanations, and repeated reassurance when they do not alter the next decision. Apply the same hierarchy to lesson, review, boss, unit, and course completion states.

## 8. Design the question type before the screen

The answer interaction is part of the learning design, not a formatting decision made after the prompt is written.

- Use `fill-in` only when producing the value or notation is itself part of the learning goal and the checker accepts reasonable equivalent forms.
- Use `yes-no` for Yes/No decisions and `true-false` for True/False claims. Render both as two large selectable buttons; spelling and capitalization must never become accidental difficulty.
- Distinguish `two-choice`, `three-choice`, and `four-choice` explicitly. If a new answer structure does not fit, define a new type before adding the question rather than quietly falling back to a text field or generic renderer.
- Use `ordering` when the learning target is a procedure, proof chain, modeling cycle, or sequence of transformations. Every step must be used exactly once, the current order must stay visible, and reset must be available without losing the question.
- Use authored choices when equivalent symbolic forms are difficult to type or normalize reliably. Factoring prompts such as `Factor 6x + 12` use four mathematically plausible choices unless a purpose-built symbolic editor and equivalence checker exist.
- Keep all options parallel in meaning, notation, unit, and precision. Distractors should expose a misconception, not a typing trap.
- A new question family must define its data shape, answer control, keyboard and assistive behavior, validation, correct feedback, recovery path, and rendering on lesson, boss, and review surfaces before content is added.

The curriculum validator must reject Yes/No or True/False questions that fall back to text input, and reject known high-friction symbolic families that lack an appropriate answer control. The same shared response component must render each type everywhere.

## 9. Make feedback strong, brief, and useful

Correct feedback should clearly close the action loop without making the learner wait to continue.

- Use a visible magnitude cue: the success phrase grows, settles, then clears.
- Keep duration consistent across the flash, mark, particles, and message. A longer celebration is acceptable when the next action remains available and reduced-motion removes nonessential movement.
- Do not turn a wrong answer into a lecture. Show one short diagnosis and one actionable clue.
- Put supporting instruction behind a clearly named control such as `Review the key idea`; opening it should reveal the exact concept needed for the retry.
- Preserve full credit where intended and say it once. Do not stack reassurance, a three-step workflow, and game-system terminology around the same mistake.

## 10. Show the attempted state on the object being changed

Every action must visibly affect the object the learner acted on, including an incorrect attempt.

- If a button plots a point, every submitted coordinate must appear on the graph immediately. Do not reject a wrong point silently while updating only a paragraph elsewhere.
- Distinguish the learner's attempt from the target with color, shape, labels, and accessible descriptions. Attach corrective guides to the same diagram so the learner can compare positions.
- Promote a correct attempt into the saved task state. Keep an incorrect attempt available long enough to inspect and replace it on the next try.
- When an invalid input truly cannot be rendered, show the reason beside the control and preserve the last valid visual. A missing visual response must never be mistaken for a broken control.
- Test controls with correct, incorrect, boundary, and repeated inputs. Verify the primary visual changes, not only a status region.

This is the visual equivalent of useful wrong-answer recovery: the learner should see what their answer means before being told how to fix it.

## 11. Give each page one learning spine

An instructional page should progress through a coherent experience rather than collect locally reasonable sections.

1. Establish one concrete problem or question.
2. Let the learner act on a representation.
3. Explain the relationship revealed by that action.
4. Offer one meaningful transfer, variation, or historical connection.

For an applied equation, map every variable, coefficient, intercept, and unit to the situation. A `y = 2x + 1` mission should make `x`, `y`, `2`, and `+1` mean something observable; a fictional setting is useful only when its quantities remain mathematically coherent.

Every section must have a unique teaching job: experience, explain, practice, transfer, motivate, or navigate. Remove generic test grids, grade catalogs, slogans, and repeated summaries that cannot name a distinct learner outcome.

When the curriculum is large, use a shared experience system without making the experience generic. Classify lessons by the kind of problem they solve—such as navigation, resource allocation, structural design, uncertain evidence, repeated growth, or changing motion—then bind the lesson's own worked model to that setting. Never paste the same Mars story or illustration onto every topic.

## 12. Use history as instruction, not decoration

- Include a historical story only when it changes how the learner understands the current idea.
- Connect the story to the concept with a diagram, original mathematical object, or direct comparison. For coordinate geometry, show how an equation and a curve can describe the same relationship.
- Verify names, dates, publications, and priority claims with reliable sources. Distinguish documented history from classroom legend and avoid assigning sole credit when the historical record is shared or disputed.
- Link to a concise source for learners who want to go deeper; do not turn the main lesson into a long biography.
- Place the origin story after practice and before the saved reward when it serves as the lesson's transfer step. The learner should first use the mathematics, then see why people needed it, then complete the lesson.

## 13. Prove curriculum coverage at the lesson-objective level

A broad domain label or neighboring lesson is not proof that a topic is taught.

- Establish the actual standards authority first. The United States has state and local curriculum authority; Common Core is an auditable standards baseline, not a single federally mandated course sequence.
- Split each requested strand into concept, representation, procedure, modeling, and interpretation. One-variable inequalities do not cover two-variable half-planes; reading a quadratic graph does not cover building a quadratic model; and listing a sample space does not cover Venn unions, intersections, and complements.
- Require a named lesson objective, a worked model, five reviewed questions, and a suitable answer interaction for each distinct outcome.
- Store important scope in a machine-checked coverage contract so deleting or relabeling one required lesson fails validation.
- Append new lessons inside an existing region when possible. Do not shift existing lesson IDs and silently redirect saved learner progress.
- Record why a gap existed. Future audits should test the failed assumption, not merely search for the newly added title.

The current Algebra I audit and topic evidence live in [curriculum-coverage.md](./curriculum-coverage.md) and `lib/curriculum-coverage.ts`.

## 14. Put the useful repair clue in the first visible layer

- A collapsed hint is optional depth, not evidence that the wrong-answer state teaches anything.
- The first wrong-answer response must show a clue tied to the current question or a detected misconception. Generic directions such as “use the key idea” or “change one step” do not diagnose the learner's move.
- Keep the visible repair compact: one diagnosis, one actionable clue, then retry. Reveal the accepted form only after repeated attempts.
- If the misconception detector already supplies a more precise clue, keep the question-specific key idea available as an expandable second layer; do not repeat identical text in both layers.

## 15. Name the mathematical object in every relationship

Relational words such as `vertical`, `parallel`, `perpendicular`, `congruent`, `similar`, `complementary`, and `supplementary` must attach to the mathematical object they describe. Do not make a learner infer whether a pair of expressions represents angles, angle measures, lines, slopes, sides, or triangles.

- Write `angles measuring 3x + 10 and 5x − 30 are vertical angles`, not `3x + 10 and 5x − 30 are vertical`.
- Write `lines with slopes 2/3 and −3/2 are perpendicular`; the slopes are negative reciprocals, not perpendicular objects.
- Write `triangles with side lengths ... are similar`, not `the side lengths are similar`.

Keep the noun whenever removing it would change the mathematical meaning or make a modifier appear to describe the wrong type of object. Scan goals, key ideas, examples, worked steps, questions, hints, diagrams, and tooltips—not only headings.

## 16. Let Enter follow the learning path

Keyboard speed is part of practice fluency. Enter should trigger the one primary action that advances the current learning state.

- In a text response, Enter submits only when the response is complete and the learner is not composing text with an input method editor.
- On a selected choice, the first activation selects it and the next Enter submits it. Never submit an unselected option by surprise.
- After feedback, Enter advances to the next question, retry, lesson, boss, or completion action represented by the dominant CTA.
- Do not steal Enter from text areas, links, alternate buttons, open dialogs, hints, or editable controls. Ignore key repeat and modifier shortcuts.
- Add an accessible keyboard-shortcut name to the primary control and keep click/tap behavior identical.
- The shortcut must respect busy, disabled, and duplicate-submission guards. One keypress creates one state transition.

## 17. Triangulate curriculum depth

Coverage audits must compare several kinds of authority instead of treating one broad standards label as a complete course.

- Use Common Core as the portable Grade 7–12 baseline, then compare state frameworks for sequencing and mathematical practices.
- Use current AP course descriptions for advanced Calculus and Statistics depth.
- Treat Kang Chiao Grades 7–10 as an MYP/Common Core-informed pathway and Grades 11–12 as branching AP or IB pathways. Do not invent one universal Kang Chiao grade sequence.
- Use IB Mathematics AA/AI guides to test inquiry, modeling, technology, proof, and interpretation—not only topic names.
- Record every confirmed gap in the machine-readable coverage contract with named lesson evidence and five reviewed questions.
- A topic is not complete until it includes a suitable representation, a worked reasoning chain, practice across more than recall, and an interaction type that fits the response.
