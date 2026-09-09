import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test, { after } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) return { url: new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".tsx")) return { format: "module", source: ts.transpileModule(readFileSync(new URL(url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, shortCircuit: true };
    return next(url, context);
  },
});
const { QuestionResponse } = await import("../app/components/QuestionResponse.tsx");
after(() => hooks.deregister());

function question(xMin, xMax, yMin, yMax) {
  return { interaction: "graph-choice", choices: ["A", "B", "C", "D"], interactionConfig: { kind: "graph-choice", xMin, xMax, yMin, yMax, plots: [1, 2, 3, -2].map((a, index) => ({ value: "ABCD"[index], optionLabel: `Graph ${"ABCD"[index]}`, label: `Curve ${"ABCD"[index]} has amplitude ${Math.abs(a)} and crosses (0, 1).`, kind: "sine", a, b: 2, k: 1 })) } };
}
function render(q) { return renderToStaticMarkup(createElement(QuestionResponse, { question: q, value: "B", disabled: false, invalid: false, onChange() {}, onSubmit() {} })); }

test("graph choices render numeric scale and exact pi ticks without relying on hidden chart geometry", () => {
  const html = render(question(0, 2 * Math.PI, -5, 5));
  assert.match(html, /x: 0 to 2π · y: −5 to 5/);
  assert.equal((html.match(/>π<\/text>/g) ?? []).length, 4);
  assert.equal((html.match(/>2π<\/text>/g) ?? []).length, 4);
  assert.equal((html.match(/>−5<\/text>/g) ?? []).length, 4);
  assert.match(html, /aria-label="Curve B has amplitude 2 and crosses \(0, 1\)\." aria-pressed="true"/);
  assert.match(html, /<span>Graph B<\/span>/);
});

test("fractional-pi and positive-only numeric scales retain their meaning, with a separate clipping region for each plot", () => {
  const html = render(question(-Math.PI / 2, Math.PI / 2, 1, 5));
  assert.match(html, /x: −π\/2 to π\/2 · y: 1 to 5/);
  assert.equal((html.match(/>3<\/text>/g) ?? []).length, 4, "A window above zero uses its visible midpoint 3");
  const clipIds = [...html.matchAll(/<clipPath id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(clipIds).size, 4);
  for (const id of clipIds) assert.ok(html.includes(`clip-path="url(#${id})"`), "Each curve must stay inside its own coordinate window");
});


test("a window crossing zero labels the actual axes rather than a nearby numerical midpoint", () => {
  const html = render(question(-2, 3, -5, 6));
  assert.equal((html.match(/>0<\/text>/g) ?? []).length, 8, "Both coordinate axes need a clear zero label in every graph");
  assert.doesNotMatch(html, />0\.5<\/text>/, "A nearby midpoint must not look like the zero axis");
  assert.match(html, /x: −2 to 3 · y: −5 to 6/);
});
