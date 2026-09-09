import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test, { after } from "node:test";
import ts from "typescript";

const runtimeKey = Symbol.for("math.enter-action-test.runtime");
const mockReactUrl = `data:text/javascript,${encodeURIComponent(`
  export function useRef(value) { return { current: value }; }
  export function useEffect(effect) {
    const cleanup = effect();
    if (cleanup) globalThis[Symbol.for("math.enter-action-test.runtime")].cleanups.push(cleanup);
  }
  export function useId() { return "enter-action-test"; }
`)}`;
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "react" && /\/(?:useEnterAction\.ts|QuestionResponse\.tsx)$/.test(context.parentURL ?? "")) {
      return { url: mockReactUrl, shortCircuit: true };
    }
    if (specifier.startsWith("@/")) return { url: new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".tsx")) return {
      format: "module",
      source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText,
      shortCircuit: true,
    };
    return next(url, context);
  },
});
const { useEnterAction } = await import("../app/components/useEnterAction.ts");
const { QuestionResponse } = await import("../app/components/QuestionResponse.tsx");
after(() => hooks.deregister());

// Model only the DOM behavior the hook consumes. SVGElement deliberately does
// not inherit HTMLElement, so narrowing to HTMLElement would lose its role.
class TestElement {
  constructor(tagName, attributes = {}, parentElement = null) {
    Object.assign(this, { tagName, attributes, parentElement });
  }
  closest(selector) {
    const matches = selector.split(",").map((part) => part.trim());
    if (matches.some((part) => {
      const attribute = part.match(/^\[([^=]+)=['"]([^'"]+)['"]\]$/);
      return attribute ? this.attributes[attribute[1]] === attribute[2] : this.tagName === part;
    })) return this;
    return this.parentElement?.closest(selector) ?? null;
  }
}
class TestHTMLElement extends TestElement {}
class TestSVGElement extends TestElement {}

function harness(t, enabled = true) {
  const listeners = new Set();
  const runtime = { cleanups: [] };
  let advances = 0;
  const replacements = {
    Element: TestElement,
    HTMLElement: TestHTMLElement,
    SVGElement: TestSVGElement,
    window: {
      addEventListener(type, listener) { assert.equal(type, "keydown"); listeners.add(listener); },
      removeEventListener(type, listener) { assert.equal(type, "keydown"); listeners.delete(listener); },
    },
    document: { querySelector() { return null; } },
    [runtimeKey]: runtime,
  };
  const originals = Reflect.ownKeys(replacements).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  for (const key of Reflect.ownKeys(replacements)) Object.defineProperty(globalThis, key, { value: replacements[key], writable: true, configurable: true });
  t.after(() => {
    for (const cleanup of runtime.cleanups) cleanup();
    assert.equal(listeners.size, 0, "Unmount removes the global key listener");
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  // React effects are mocked above so the hook's real listener can run without a renderer.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEnterAction(() => { advances += 1; }, enabled);
  return {
    get advances() { return advances; },
    dispatch(event) { if (!event.propagationStopped) for (const listener of listeners) listener(event); },
  };
}

function keyEvent(overrides = {}) {
  return {
    key: "Enter", target: new TestHTMLElement("main"), defaultPrevented: false,
    propagationStopped: false, repeat: false, isComposing: false,
    altKey: false, ctrlKey: false, metaKey: false, shiftKey: false,
    nativeEvent: { isComposing: false },
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this.propagationStopped = true; },
    ...overrides,
  };
}

test("a plain page Enter advances once and consumes the event", (t) => {
  const app = harness(t);
  const event = keyEvent();
  app.dispatch(event);
  assert.equal(app.advances, 1);
  assert.equal(event.defaultPrevented, true);
  app.dispatch(event);
  assert.equal(app.advances, 1, "An already consumed event cannot advance again");
});

test("an event handled locally never triggers the global Enter action", (t) => {
  const app = harness(t);
  const event = keyEvent();
  event.preventDefault();
  app.dispatch(event);
  assert.equal(app.advances, 0);
});

test("SVG role buttons and their descendants retain Enter ownership", (t) => {
  const app = harness(t);
  const circle = new TestSVGElement("circle", { role: "button" });
  assert.equal(circle instanceof TestHTMLElement, false);
  for (const target of [circle, new TestSVGElement("title", {}, circle), new TestHTMLElement("button"), new TestHTMLElement("input")]) {
    const event = keyEvent({ target });
    app.dispatch(event);
    assert.equal(app.advances, 0);
    assert.equal(event.defaultPrevented, false, "The global listener leaves local controls to handle their own keys");
  }
});

test("modifier, IME, repeat and non-Enter events do not advance", (t) => {
  const app = harness(t);
  for (const override of [{ altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { isComposing: true }, { repeat: true }, { key: " " }]) {
    const event = keyEvent(override);
    app.dispatch(event);
    assert.equal(app.advances, 0);
    assert.equal(event.defaultPrevented, false);
  }
});

function descendants(node) {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!node || typeof node !== "object") return [];
  return [node, ...descendants(node.props?.children)];
}

for (const selected of [false, true]) {
  test(`coordinate Enter ${selected ? "submits the selected point" : "selects a point"} without advancing`, (t) => {
    const app = harness(t);
    const changes = [];
    let submissions = 0;
    const response = QuestionResponse({
      question: { interaction: "coordinate-grid", interactionConfig: { kind: "coordinate-grid", xMin: 0, xMax: 1, yMin: 0, yMax: 1 } },
      value: selected ? "(1, 1)" : "", disabled: false, invalid: false,
      onChange(value) { changes.push(value); },
      onSubmit() { submissions += 1; },
    });
    // Execute the actual returned coordinate component and its actual JSX
    // handler; no source-pattern assertion stands in for event behavior.
    const tree = response.type(response.props);
    const point = descendants(tree).find((node) => node.type === "circle" && node.props["aria-label"] === "Point 1, 1");
    assert.ok(point);
    const event = keyEvent({ target: new TestSVGElement("circle", { role: "button" }) });
    point.props.onKeyDown(event);
    app.dispatch(event);
    assert.deepEqual(changes, selected ? [] : ["(1, 1)"]);
    assert.equal(submissions, selected ? 1 : 0);
    assert.equal(event.defaultPrevented, true);
    assert.equal(event.propagationStopped, true, "Both coordinate Enter branches stop bubbling before page advance");
    assert.equal(app.advances, 0);
  });
}
