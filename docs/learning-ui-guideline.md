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
- Use `graph-choice` when the learner must distinguish shape, intercept, vertex, center, radius, asymptote, phase, slope, concavity, or signed area. Render authored mini-graphs from structured data; a text label alone does not test graph reading.
- Use `table-choice` when the learner must select a valid proof row, parameter set, conditional denominator, sequence rule, limit statement, probability model, or study design. Keep column meanings visible and make the entire row selectable by mouse, touch, and keyboard.
- Use authored choices when equivalent symbolic forms are difficult to type or normalize reliably. Factoring prompts such as `Factor 6x + 12` use four mathematically plausible choices unless a purpose-built symbolic editor and equivalence checker exist.
- Separate recognition from construction. If the learner is identifying a term, category, property, direction, relationship, label, or verbal explanation, use authored choices even when the expected response is only one English word. Free response is for constructing a number or mathematical notation, not reproducing the author's sentence.
- Do not use a longer alias list as the primary repair for a verbal fill-in. It cannot anticipate every valid synonym, omitted article, plural, hyphen, spelling error, or equally correct paraphrase. Put the intended meanings into visible, parallel choices and let the learner make the mathematical distinction directly.
- A phrase-sensitive audit must inspect the assembled question bank, not only source tuples. Any remaining `fill-in` question must have at least one accepted compact numeric or symbolic form that the checker can compare reliably.
- Keep all options parallel in meaning, notation, unit, and precision. Distractors should expose a misconception, not a typing trap.
- A new question family must define its data shape, answer control, keyboard and assistive behavior, validation, correct feedback, recovery path, and rendering on lesson, boss, and review surfaces before content is added.
- For Grade 10–12, every region must include at least one visual-reasoning mission and every grade must use at least nine interaction families. Adding more fill-in calculations does not satisfy advanced representation coverage.

The curriculum validator must reject Yes/No or True/False questions that fall back to text input, and reject known high-friction symbolic families that lack an appropriate answer control. The same shared response component must render each type everywhere.

### Recognition-versus-construction review

Ask what evidence the response is supposed to produce:

- `In 3/5, what does 5 represent?` tests the meaning of a denominator. Use parallel meanings as choices; do not require the exact phrase `the total number of equal parts`.
- `Which model fits constant ratios?`, `What is this property called?`, and `Does the parabola open up or down?` test classification. Use choices.
- `Solve 3x + 7 = 22`, `write the equation`, or `plot (3, −2)` asks the learner to construct a mathematical object. A purpose-built control or fill-in may be appropriate when equivalent forms are accepted.

Choices must still test understanding. Use plausible alternatives from the same semantic family, keep notation and grammatical form parallel, and include exactly one mathematically correct option. Avoid throwaway distractors whose length, detail, or absurdity reveals the answer.

### Representation coverage is a second coverage contract

Topic coverage and representation coverage are different. A lesson title can exist while learners never read a graph, compare a table, place a point, interpret a boundary, select several valid claims, or assemble a reasoning chain. Audit the interaction distribution by grade and region before adding content so a larger bank does not become a larger collection of the same fill-in task.

- Maintain a matrix from region to learning objective, interaction family, instructional visual, renderer, and mobile behavior.
- Every Grade 8–9 region must include at least one visual-reasoning mission, and each of those grades must use at least ten interaction families. Every Grade 10–12 region follows the same region rule, with at least nine interaction families per grade.
- `graph-choice` options are structured graph specifications, not screenshots or text labels pretending to test graph reading.
- `table-choice` options preserve named columns and row relationships in their authored data so the same mathematics survives desktop and mobile layouts.
- A representation counts only when the learner must inspect or manipulate it to answer; a decorative image beside a text-only question does not count.

### Structured visual choices have a responsive contract

- Make the full graph or table row the selectable target and show selection immediately.
- Use a compact two-column graph grid on desktop and one column on narrow phones.
- Transform wide tables into labeled row cards on mobile. Do not require horizontal scrolling to compare answer choices, and never detach a value from its column meaning.
- Give each option one concise accessible name. Nested SVG titles must not produce duplicate announcements.
- Preserve radio semantics, focus order, touch targets, and the shared select-then-submit Enter behavior at every breakpoint.

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

### Story and diagram resolve from the same semantic key

Story copy, variables, equations, diagram, and labels must model one situation. Do not pair correct prose with a generic or unrelated scene merely because both mention movement, change, or exploration.

- Give semantically important lessons and regions an explicit scene key; broad keyword matching is only a fallback for genuinely generic content.
- Trace `lesson or region -> story -> scene -> SVG -> visible and accessible labels` during review.
- Make coefficients, intercepts, rates, domains, and units correspond to objects in the scene.
- Judge the assembled page, not the copy and illustration in isolation. If a learner cannot point from the story quantity to the visual mark, the scene is decoration rather than teaching.
- Do not reuse one grade-level hero image across every lesson when the lesson already has a distinct mathematical setting. Prefer the lightweight lesson-matched scene whose marks, labels, and geometry can change with the story.

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

## 18. Make saved progress inspectable and replayable

A history row, earned badge, achievement, XP level, or other object-backed progress surface is not only decoration. It is a compact index into the learner's own evidence and should open on demand without expanding every card by default.

- Keep the resting card concise. Clicking or pressing it opens one shared accessible detail dialog with status, the object that produced it, useful completion evidence, and one relevant next action.
- A completed lesson opens its saved grade, region, date, best stars, and first-try result, then offers `Replay lesson` without deleting the original clear.
- A cleared boss opens its saved hearts and completion date, then offers `Replay boss`.
- A lesson badge points back to its lesson. A cross-lesson answer badge explains the answer threshold and points to recall or practice instead of inventing a lesson association.
- Achievements and XP show their real source metric and current threshold. Their CTA returns to the closest activity that can reproduce or improve that outcome.
- Use stable lesson and region identifiers in saved history and destination resolution. Preserve key-based fallback for older records so a UI upgrade does not strand existing progress.
- The dialog must support Escape, backdrop close, focus containment, focus restoration, keyboard activation, and a phone layout without horizontal overflow.

Do not make every completed card permanently verbose just to prove it is clickable. Use hover, focus, pressed treatment, a concise accessible name, and the shared dialog to reveal depth when requested.

## 19. Acknowledge navigation once

Every same-tab navigation action must acknowledge the first click before the next page appears.

- Mark the chosen link busy immediately, expose `aria-busy`, prevent a second navigation activation, and show one global loading signal.
- Keep same-page anchor jumps, downloads, modifier-assisted clicks, and new-tab links out of the blocking path; they serve different interaction intents.
- Clear the pending state when a page is restored from browser history so Back never returns to a disabled interface.
- Programmatic navigation after a mutation must use the same principle locally: disable the trigger, change to a busy label, and restore it only when retrying is safe.
- Motion is optional. The disabled state, busy text, and live status must still communicate progress when reduced motion is enabled.

This rule applies to header navigation, maps, completion CTAs, history replay, badge replay, legal/footer links, sign-in exits, and any future control that changes the current page.

## 20. Return the viewport to the new learning object

An action is not complete when the data changes; the replacement must also become the visible and accessible reading position.

- When `Next`, `Continue`, `Retry`, `Finish`, `Reveal`, or `Open` replaces the main lesson stage, question, recovery task, badge page, map section, or completion outcome on the same route, scroll to the beginning of the new object after React commits it.
- Move programmatic focus to the new object's unique heading, or to a labelled boundary when the stage has no heading. Focus first with `preventScroll`, then position the content container. Do not autofocus an answer field and make the learner miss the new prompt or open the phone keyboard.
- Keep one shared transition helper. Give every target a stable ref, `tabIndex={-1}`, and enough `scroll-margin-top` for the sticky learner header, the mobile lesson status bar, and the device safe area.
- Use smooth motion only when `prefers-reduced-motion` allows it. Reduced motion changes the travel, not the destination or focus target.
- Do not reposition for answer feedback, hints, selecting an option, filters, tabs, modal interactions, or a live graph update that remains inside the same learning object.
- A forward internal route without a hash starts at the destination page heading after the route commits. A hash retains its exact destination. Browser Back and Forward retain native scroll restoration, and the source page must never jump to its top before navigation succeeds.
- Test with the activating CTA below the fold at desktop and phone sizes. The new target must sit below the sticky stack, its heading must be `document.activeElement`, and one activation may produce at most one focus move and one scroll move.

This contract applies to lesson stages and practice questions, Memory Check, Boss questions and repair, Daily Review, completion pages, staged worked examples, graph missions, multi-badge reveals, catalog expansion, and any future in-place learning flow.

## 21. Progress spectacle through vocabulary, not volume

A reward system should feel finished on the first day and still reveal new craft on the tenth. Do not replay one identical burst forever, and do not solve habituation by making every later event longer, brighter, or noisier.

- Tie permanent visual evolution to durable learning milestones such as unique lesson clears. Replays and easy answer farming must not advance the experience tier.
- Separate semantic outcome, motion, material, and story. `Correct`, `Level up`, `Badge earned`, and `Boss cleared` stay plain; their visual vocabulary may evolve.
- Add one recognizable visual idea at a time: a particle shape, path geometry, medal material, halo, story location, or color layer. Preserve continuity so the learner recognizes the same system becoming richer.
- Keep ordinary correct answers finite and non-blocking. Reserve full-screen ceremony for genuine unlocks, level changes, and Boss victories; keep every interruptible celebration skippable.
- Use the current story chapter as a concise establishing image, not another explanatory card. The image must reinforce the journey and leave the mathematical task visually dominant.
- Later rarity must come from craft and composition, not hidden labels or arbitrary scarcity. A more advanced badge should look more carefully made even before its name is read.
- Make reduced motion a designed state. Keep the check, badge, result, color hierarchy, and next action while removing spins, pans, flashes, and particle travel.
- Define the stage sequence as data. Components consume motif, motion family, material, intensity, and art position; adding stages 21–40 or 41–60 must not require new answer or Boss flow branches.

The current twenty-stage, one-hundred-lesson route and its extension contract live in [experience-progression.md](./experience-progression.md).
