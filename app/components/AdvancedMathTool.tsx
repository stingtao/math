"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { LessonDefinition } from "@/lib/curriculum";

type Point = { x: number; y: number };
type FunctionModel = { label: string; formula: string; fn: (x: number) => number | null };

const functionModels: Record<string, FunctionModel> = {
  polynomial: { label: "Polynomial", formula: "f(x)=x²−2", fn: (x) => x * x - 2 },
  rational: { label: "Rational", formula: "f(x)=1/x", fn: (x) => Math.abs(x) < .08 ? null : 1 / x },
  radical: { label: "Radical", formula: "f(x)=√(x+2)", fn: (x) => x < -2 ? null : Math.sqrt(x + 2) },
  exponential: { label: "Exponential", formula: "f(x)=2ˣ", fn: (x) => 2 ** x },
  logarithm: { label: "Logarithmic", formula: "f(x)=log₂(x+3)", fn: (x) => x <= -3 ? null : Math.log2(x + 3) },
  trigonometric: { label: "Sine", formula: "f(x)=2sin(x)", fn: (x) => 2 * Math.sin(x) },
  parabola: { label: "Parabola", formula: "f(x)=x²/2", fn: (x) => x * x / 2 },
  linear: { label: "Linear", formula: "f(x)=1.5x−1", fn: (x) => 1.5 * x - 1 },
};

function number(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? "0.0" : rounded.toFixed(1);
}

function svgPoint(point: Point) {
  return { x: 160 + point.x * 30, y: 125 - point.y * 22 };
}

function pathFor(fn: FunctionModel["fn"]) {
  const pieces: string[] = [];
  let drawing = false;
  for (let x = -5; x <= 5.001; x += .08) {
    const y = fn(x);
    if (y === null || !Number.isFinite(y) || Math.abs(y) > 6) { drawing = false; continue; }
    const p = svgPoint({ x, y });
    pieces.push(`${drawing ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    drawing = true;
  }
  return pieces.join(" ");
}

function toolMode(lesson: LessonDefinition) {
  const slug = lesson.slug;
  if (/logic-and-conditionals/.test(slug)) return "logic";
  if (/sets-and-venn/.test(slug)) return "venn";
  if (/categorical-data/.test(slug)) return "categorical";
  if (/geometric-constructions/.test(slug)) return "construction";
  if (/laws-of-sines-and-cosines/.test(slug)) return "triangle-law";
  if (/cross-sections-and-rotations/.test(slug)) return "cross-section";
  if (/complex-arithmetic|complex-polynomial-solutions|complex-plane/.test(slug)) return "complex";
  if (/polynomial-identities/.test(slug)) return "identity";
  if (/decision-strategies/.test(slug)) return "decision";
  if (/limit|derivative|tangent|motion|increasing|optimization|antiderivative|integral|fundamental/.test(slug)) return "calculus";
  if (/trig|radian|unit-circle|polar|complex-plane/.test(slug)) return "circle";
  if (/probability|independence|sampling|distribution|expected|binomial|hypothesis|confidence|statistical|data|regression/.test(slug)) return "probability";
  if (/matrix|vector/.test(slug)) return "vector";
  if (lesson.grade === 10 || /circle|ellipse|hyperbola|parabola-as|conic|geometry|scale|volume|distance|coordinate|triangle|congruence|angle|chord|arc/.test(slug)) return "scale";
  return "function";
}

function modelFor(lesson: LessonDefinition) {
  const slug = lesson.slug;
  if (/rational/.test(slug)) return functionModels.rational;
  if (/radical/.test(slug)) return functionModels.radical;
  if (/exponential|compound|geometric/.test(slug)) return functionModels.exponential;
  if (/log/.test(slug)) return functionModels.logarithm;
  if (/trig|sine|cosine/.test(slug)) return functionModels.trigonometric;
  if (/parabola|quadratic|polynomial|root/.test(slug)) return functionModels.polynomial;
  return functionModels.linear;
}

function RangeControl({ label, display, value, min, max, step, onChange }: { label: string; display: ReactNode; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const move = (direction: -1 | 1) => onChange(Math.round(Math.min(max, Math.max(min, value + direction * step)) * 100) / 100);
  return <label><span>{label} <b>{display}</b></span><div className="advanced-range-control"><button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => move(-1)}>−</button><input aria-label={`${label} ${display}`} type="range" min={min} max={max} step={step} value={value} onInput={(event) => onChange(Number(event.currentTarget.value))} /><button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => move(1)}>+</button></div></label>;
}

export function AdvancedMathTool({ lesson }: { lesson: LessonDefinition }) {
  const mode = toolMode(lesson);
  return <section className={`advanced-math-tool tool-${mode} accent-${lesson.accent}`} aria-label={`${lesson.title} interactive concept tool`}>
    <header><span><small>MOVE IT · NOTICE IT · EXPLAIN IT</small><strong>{lesson.title} Lab</strong></span><b>Not saved</b></header>
    {mode === "logic" ? <LogicLab /> : mode === "venn" ? <VennLab /> : mode === "categorical" ? <CategoricalDataLab /> : mode === "construction" ? <ConstructionLab /> : mode === "triangle-law" ? <TriangleLawLab /> : mode === "cross-section" ? <CrossSectionLab /> : mode === "complex" ? <ComplexNumberLab /> : mode === "identity" ? <PolynomialIdentityLab /> : mode === "decision" ? <DecisionLab /> : mode === "calculus" ? <CalculusLens /> : mode === "circle" ? <UnitCircleLab /> : mode === "probability" ? <ProbabilityLab /> : mode === "vector" ? <VectorLab /> : mode === "scale" ? <ScaleLab lesson={lesson} /> : <FunctionLab lesson={lesson} />}
    <footer><span aria-hidden="true">◇</span><p><strong>Move one control. Explain one change.</strong> The picture, value, and rule update together.</p></footer>
  </section>;
}

function VennLab() {
  const [selection, setSelection] = useState<"union" | "intersection" | "complement">("intersection");
  const explanation = selection === "union" ? "Everything in A or B, including the overlap." : selection === "intersection" ? "Only outcomes that belong to both A and B." : "Everything in the universal set that is not in A.";
  return <div className={`advanced-tool-workspace venn-workspace is-${selection}`}>
    <div className="venn-stage" role="img" aria-label={explanation}>
      <svg viewBox="0 0 420 280">
        <defs><clipPath id="venn-a-clip"><circle cx="175" cy="140" r="84" /></clipPath></defs>
        <rect className="venn-universe" x="28" y="24" width="364" height="232" rx="18" />
        <circle className="venn-set venn-set-a" cx="175" cy="140" r="84" />
        <circle className="venn-set venn-set-b" cx="245" cy="140" r="84" />
        <circle className="venn-overlap" cx="245" cy="140" r="84" clipPath="url(#venn-a-clip)" />
        <text x="130" y="142">A</text><text x="278" y="142">B</text><text className="venn-u-label" x="45" y="50">U</text>
      </svg>
    </div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">SET RELATION</span><h3>{selection === "union" ? "A ∪ B" : selection === "intersection" ? "A ∩ B" : "Aᶜ"}</h3><p>{explanation}</p><div className="venn-choice-grid" aria-label="Choose a set relationship">{(["union", "intersection", "complement"] as const).map((item) => <button className={selection === item ? "selected" : ""} type="button" aria-pressed={selection === item} onClick={() => setSelection(item)} key={item}>{item === "union" ? "A ∪ B" : item === "intersection" ? "A ∩ B" : "Aᶜ"}</button>)}</div><div className="advanced-live-value"><small>READ THE SHADE</small><strong>{selection === "union" ? "A or B" : selection === "intersection" ? "A and B" : "not A"}</strong></div></div>
  </div>;
}

function CategoricalDataLab() {
  const [group, setGroup] = useState<"A" | "B">("A");
  const values = group === "A" ? { yes: 30, total: 50 } : { yes: 42, total: 70 };
  const percent = Math.round(values.yes / values.total * 100);
  return <div className="advanced-tool-workspace categorical-workspace">
    <div className="categorical-stage">
      <table aria-label="Preference counts by group"><thead><tr><th>Group</th><th>Yes</th><th>No</th><th>Total</th></tr></thead><tbody><tr className={group === "A" ? "selected" : ""}><th>A</th><td>30</td><td>20</td><td>50</td></tr><tr className={group === "B" ? "selected" : ""}><th>B</th><td>42</td><td>28</td><td>70</td></tr><tr><th>Total</th><td>72</td><td>48</td><td>120</td></tr></tbody></table>
    </div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">CONDITIONAL RATE</span><h3>Compare within one group.</h3><p>Use that group&apos;s total as the denominator. Raw counts alone can make a larger group look stronger.</p><div className="categorical-choice-grid" aria-label="Choose a group">{(["A", "B"] as const).map((item) => <button className={group === item ? "selected" : ""} type="button" aria-pressed={group === item} onClick={() => setGroup(item)} key={item}>Group {item}</button>)}</div><div className="advanced-live-value"><small>YES WITHIN GROUP {group}</small><strong>{values.yes} ÷ {values.total} = {percent}%</strong></div></div>
  </div>;
}

function LogicLab() {
  const [premise, setPremise] = useState(true);
  const [conclusion, setConclusion] = useState(true);
  const conditional = !premise || conclusion;
  const cases = [
    { premise: true, conclusion: true },
    { premise: true, conclusion: false },
    { premise: false, conclusion: true },
    { premise: false, conclusion: false },
  ];

  return <div className="advanced-tool-workspace logic-workspace">
    <div className="logic-stage" role="img" aria-label={`If p then q is ${conditional ? "true" : "false"} when p is ${premise ? "true" : "false"} and q is ${conclusion ? "true" : "false"}`}>
      <div className="logic-statement"><span className={premise ? "is-true" : "is-false"}><small>p</small><strong>{premise ? "TRUE" : "FALSE"}</strong></span><i aria-hidden="true">→</i><span className={conclusion ? "is-true" : "is-false"}><small>q</small><strong>{conclusion ? "TRUE" : "FALSE"}</strong></span></div>
      <div className={`logic-verdict ${conditional ? "is-true" : "is-false"}`}><small>p → q</small><strong>{conditional ? "TRUE" : "FALSE"}</strong></div>
      <p>{conditional ? "The promise holds in this case." : "This is the one case that breaks the promise."}</p>
    </div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">TRUTH TABLE</span><h3>Test every possible case.</h3><p>An if-then statement is false only when p is true and q is false.</p><div className="logic-case-grid" aria-label="Choose values for p and q">{cases.map((item) => {
      const selected = premise === item.premise && conclusion === item.conclusion;
      return <button className={selected ? "selected" : ""} type="button" aria-pressed={selected} onClick={() => { setPremise(item.premise); setConclusion(item.conclusion); }} key={`${item.premise}-${item.conclusion}`}>p={item.premise ? "T" : "F"} · q={item.conclusion ? "T" : "F"}</button>;
    })}</div><div className="advanced-live-value"><small>CONTRAPOSITIVE</small><strong>not q → not p: {conditional ? "true" : "false"}</strong></div></div>
  </div>;
}

function Axes({ children }: { children: ReactNode }) {
  return <svg className="advanced-tool-graph" viewBox="0 0 320 250" role="img" aria-label="Coordinate graph that updates with the controls">
    <g className="advanced-grid">{Array.from({ length: 11 }, (_, index) => <line key={`v${index}`} x1={10 + index * 30} x2={10 + index * 30} y1="15" y2="235" />)}{Array.from({ length: 11 }, (_, index) => <line key={`h${index}`} x1="10" x2="310" y1={15 + index * 22} y2={15 + index * 22} />)}</g>
    <line className="advanced-axis" x1="10" x2="310" y1="125" y2="125" /><line className="advanced-axis" x1="160" x2="160" y1="15" y2="235" />
    {children}
  </svg>;
}

function FunctionLab({ lesson }: { lesson: LessonDefinition }) {
  const model = modelFor(lesson);
  const [x, setX] = useState(1);
  const y = model.fn(x);
  const point = y === null ? null : svgPoint({ x, y });
  const table = [-1, 0, 1].map((offset) => ({ x: x + offset, y: model.fn(x + offset) }));
  return <div className="advanced-tool-workspace">
    <div className="advanced-tool-visual"><Axes><path className="advanced-function-path" d={pathFor(model.fn)} />{point && Math.abs(y!) <= 6 && <g className="advanced-active-point"><circle cx={point.x} cy={point.y} r="7" /><text x={Math.min(252, point.x + 10)} y={Math.max(25, point.y - 10)}>({number(x)}, {number(y!)})</text></g>}</Axes></div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">{model.label.toUpperCase()} MODEL</span><h3>{model.formula}</h3><p>Choose an input. Watch its point move on the curve, then compare nearby inputs.</p><RangeControl label="Input x" display={number(x)} value={x} min={-3} max={3} step={.5} onChange={setX} /><div className="advanced-live-value"><small>OUTPUT</small><strong>{y === null ? "undefined" : `f(${number(x)}) = ${number(y)}`}</strong></div><div className="advanced-value-table" role="table" aria-label="Nearby function values">{table.map((item) => <span role="row" key={item.x}><b role="cell">x={number(item.x)}</b><i role="cell">{item.y === null ? "—" : number(item.y)}</i></span>)}</div></div>
  </div>;
}

function CalculusLens() {
  const [x, setX] = useState(1);
  const y = x * x;
  const slope = 2 * x;
  const p = svgPoint({ x, y: y / 2 });
  const tangent = (value: number) => (slope * (value - x) + y) / 2;
  return <div className="advanced-tool-workspace">
    <div className="advanced-tool-visual"><Axes><path className="advanced-area-path" d="M160,125 L160,125 C190,114 220,81 250,26 L250,125 Z" /><path className="advanced-function-path" d={pathFor((value) => value * value / 2)} /><path className="advanced-tangent-path" d={`M${svgPoint({ x: -5, y: tangent(-5) }).x},${svgPoint({ x: -5, y: tangent(-5) }).y} L${svgPoint({ x: 5, y: tangent(5) }).x},${svgPoint({ x: 5, y: tangent(5) }).y}`} /><g className="advanced-active-point"><circle cx={p.x} cy={p.y} r="7" /></g></Axes></div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">CALCULUS LENS · f(x)=x²</span><h3>One point, three connected meanings.</h3><p>The point gives the function value, the tangent gives instantaneous slope, and the shaded region suggests accumulated area.</p><RangeControl label="Point x" display={number(x)} value={x} min={-2.5} max={2.5} step={.5} onChange={setX} /><div className="advanced-metric-grid"><span><small>VALUE</small><strong>{number(y)}</strong></span><span><small>DERIVATIVE 2x</small><strong>{number(slope)}</strong></span><span><small>∫₀ˣ t²dt</small><strong>{number(x ** 3 / 3)}</strong></span></div></div>
  </div>;
}

const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
function UnitCircleLab() {
  const [index, setIndex] = useState(2);
  const degrees = angles[index];
  const radians = degrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const cx = 150 + cosine * 92;
  const cy = 125 - sine * 92;
  return <div className="advanced-tool-workspace">
    <div className="advanced-tool-visual"><svg className="unit-circle-visual" viewBox="0 0 300 250" role="img" aria-label={`Unit-circle point at ${degrees} degrees has coordinates ${number(cosine)}, ${number(sine)}`}><line x1="30" x2="270" y1="125" y2="125" /><line x1="150" x2="150" y1="10" y2="240" /><circle cx="150" cy="125" r="92" /><path d={`M150,125 L${cx},${cy}`} /><line className="unit-circle-cos" x1="150" x2={cx} y1={cy} y2={cy} /><line className="unit-circle-sin" x1={cx} x2={cx} y1="125" y2={cy} /><circle className="unit-circle-point" cx={cx} cy={cy} r="8" /></svg></div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">UNIT CIRCLE</span><h3>Angle → point → sine and cosine</h3><p>The horizontal coordinate is cosine. The vertical coordinate is sine.</p><RangeControl label="Angle" display={`${degrees}°`} value={index} min={0} max={angles.length - 1} step={1} onChange={setIndex} /><div className="advanced-metric-grid"><span><small>RADIANS</small><strong>{number(radians)} rad</strong></span><span><small>COSINE · x</small><strong>{number(cosine)}</strong></span><span><small>SINE · y</small><strong>{number(sine)}</strong></span></div></div>
  </div>;
}

function ProbabilityLab() {
  const [probability, setProbability] = useState(.5);
  const [trials, setTrials] = useState(20);
  const [run, setRun] = useState(1);
  const successes = useMemo(() => Array.from({ length: trials }, (_, index) => ((index * 7919 + run * 104729 + 37) % 1000) / 1000 < probability).filter(Boolean).length, [probability, trials, run]);
  return <div className="advanced-tool-workspace probability-workspace">
    <div className="probability-stage" aria-label={`${successes} successes in ${trials} simulated trials`}><span className="probability-orbit"><strong>{successes}</strong><small>observed successes</small></span><div className="probability-dots" aria-hidden="true">{Array.from({ length: trials }, (_, index) => <i className={((index * 7919 + run * 104729 + 37) % 1000) / 1000 < probability ? "success" : ""} key={index} />)}</div><b>Expected ≈ {number(trials * probability)}</b></div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">REPEATABLE CHANCE LAB</span><h3>Probability predicts a long-run pattern.</h3><p>Run another sample. Short runs vary; larger runs tend to settle nearer the expected proportion.</p><RangeControl label="Success chance p" display={`${Math.round(probability * 100)}%`} value={probability} min={.1} max={.9} step={.1} onChange={setProbability} /><RangeControl label="Number of trials" display={trials} value={trials} min={10} max={60} step={10} onChange={setTrials} /><button className="secondary-button" type="button" onClick={() => setRun((value) => value + 1)}>Run another sample</button><div className="advanced-live-value"><small>OBSERVED PROPORTION</small><strong>{number(successes / trials * 100)}%</strong></div></div>
  </div>;
}

function VectorLab() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const endpoint = svgPoint({ x: a, y: b });
  const magnitude = Math.hypot(a, b);
  const dot = 2 * a - b;
  return <div className="advanced-tool-workspace"><div className="advanced-tool-visual"><Axes><defs><marker id="vector-arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" /></marker></defs><line className="vector-arrow" x1="160" y1="125" x2={endpoint.x} y2={endpoint.y} markerEnd="url(#vector-arrow)" /><g className="advanced-active-point"><circle cx={endpoint.x} cy={endpoint.y} r="7" /></g></Axes></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">VECTOR BUILDER</span><h3>⟨{number(a)}, {number(b)}⟩</h3><p>Components set direction. The Pythagorean theorem gives magnitude. The dot product compares alignment with ⟨2,−1⟩.</p><RangeControl label="Horizontal component" display={number(a)} value={a} min={-4} max={4} step={1} onChange={setA} /><RangeControl label="Vertical component" display={number(b)} value={b} min={-4} max={4} step={1} onChange={setB} /><div className="advanced-metric-grid"><span><small>MAGNITUDE</small><strong>{number(magnitude)}</strong></span><span><small>DOT WITH ⟨2,−1⟩</small><strong>{number(dot)}</strong></span></div></div></div>;
}

function ConstructionLab() {
  const [construction, setConstruction] = useState<"perpendicular" | "angle">("perpendicular");
  const description = construction === "perpendicular" ? "Equal-radius arcs locate every point that is the same distance from A and B." : "Equal arcs copy the same distance from both sides of the angle.";
  return <div className="advanced-tool-workspace construction-workspace">
    <div className="construction-stage" role="img" aria-label={description}>
      <svg viewBox="0 0 360 270">
        {construction === "perpendicular" ? <>
          <line className="construction-base" x1="70" x2="290" y1="140" y2="140" />
          <path className="construction-arc" d="M70 140 A135 135 0 0 1 180 62 M70 140 A135 135 0 0 0 180 218 M290 140 A135 135 0 0 0 180 62 M290 140 A135 135 0 0 1 180 218" />
          <line className="construction-result" x1="180" x2="180" y1="45" y2="230" />
          <circle cx="70" cy="140" r="6" /><circle cx="290" cy="140" r="6" /><circle cx="180" cy="62" r="5" /><circle cx="180" cy="218" r="5" />
          <text x="55" y="165">A</text><text x="296" y="165">B</text><text x="188" y="118">90°</text>
        </> : <>
          <line className="construction-base" x1="75" x2="310" y1="215" y2="215" /><line className="construction-base" x1="75" x2="265" y1="215" y2="72" />
          <path className="construction-arc" d="M160 215 A85 85 0 0 0 143 164 M143 164 A78 78 0 0 1 160 215 M75 215 A145 145 0 0 1 191 128" />
          <line className="construction-result" x1="75" x2="270" y1="215" y2="143" />
          <circle cx="75" cy="215" r="6" /><circle cx="191" cy="128" r="5" />
          <text x="94" y="190">θ/2</text><text x="168" y="205">θ/2</text>
        </>}
      </svg>
    </div>
    <div className="advanced-tool-panel"><span className="advanced-tool-tag">COMPASS + STRAIGHTEDGE</span><h3>{construction === "perpendicular" ? "Bisect a segment at 90°." : "Split an angle into equal parts."}</h3><p>{description}</p><div className="construction-choice-grid" aria-label="Choose a construction"><button type="button" className={construction === "perpendicular" ? "selected" : ""} aria-pressed={construction === "perpendicular"} onClick={() => setConstruction("perpendicular")}>Perpendicular bisector</button><button type="button" className={construction === "angle" ? "selected" : ""} aria-pressed={construction === "angle"} onClick={() => setConstruction("angle")}>Angle bisector</button></div><div className="advanced-live-value"><small>WHY THE ARCS WORK</small><strong>Equal radius → equal distance</strong></div></div>
  </div>;
}

function TriangleLawLab() {
  const [sideA, setSideA] = useState(6);
  const [sideB, setSideB] = useState(8);
  const [angle, setAngle] = useState(60);
  const radians = angle * Math.PI / 180;
  const sideC = Math.sqrt(sideA ** 2 + sideB ** 2 - 2 * sideA * sideB * Math.cos(radians));
  const area = .5 * sideA * sideB * Math.sin(radians);
  const scale = 14;
  const top = { x: 65 + sideB * scale * Math.cos(radians), y: 215 - sideB * scale * Math.sin(radians) };
  return <div className="advanced-tool-workspace triangle-law-workspace"><div className="triangle-law-stage" role="img" aria-label={`Triangle with sides ${sideA} and ${sideB}, included angle ${angle} degrees, and opposite side ${number(sideC)}`}><svg viewBox="0 0 360 270"><polygon points={`65,215 ${65 + sideA * scale},215 ${top.x},${top.y}`} /><path d="M91 215 A26 26 0 0 0 78 193" /><text x="90" y="197">{angle}°</text><text x={65 + sideA * scale / 2} y="242">a={sideA}</text><text x={(65 + top.x) / 2 - 28} y={(215 + top.y) / 2 - 8}>b={sideB}</text><text x={(65 + sideA * scale + top.x) / 2 + 4} y={(215 + top.y) / 2}>c={number(sideC)}</text></svg></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">NON-RIGHT TRIANGLE</span><h3>Two sides + included angle determine the third.</h3><p>Law of Cosines: c² = a² + b² − 2ab cos C.</p><RangeControl label="Side a" display={sideA} value={sideA} min={3} max={10} step={1} onChange={setSideA} /><RangeControl label="Side b" display={sideB} value={sideB} min={3} max={10} step={1} onChange={setSideB} /><RangeControl label="Included angle C" display={`${angle}°`} value={angle} min={30} max={120} step={10} onChange={setAngle} /><div className="advanced-metric-grid"><span><small>OPPOSITE SIDE c</small><strong>{number(sideC)}</strong></span><span><small>AREA · ½ab sin C</small><strong>{number(area)}</strong></span></div></div></div>;
}

function CrossSectionLab() {
  const [height, setHeight] = useState(0);
  const radius = Math.sqrt(Math.max(0, 25 - height ** 2));
  const y = 135 - height * 18;
  return <div className="advanced-tool-workspace cross-section-workspace"><div className="cross-section-stage" role="img" aria-label={`A horizontal slice ${number(height)} units from a sphere's center has radius ${number(radius)}`}><svg viewBox="0 0 360 270"><circle className="cross-section-sphere" cx="180" cy="135" r="92" /><ellipse className="cross-section-equator" cx="180" cy="135" rx="92" ry="26" /><ellipse className="cross-section-slice" cx="180" cy={y} rx={radius / 5 * 92} ry={Math.max(2, radius / 5 * 26)} /><line className="cross-section-radius" x1="180" x2={180 + radius / 5 * 92} y1={y} y2={y} /><text x="190" y={Math.max(30, y - 10)}>r={number(radius)}</text></svg></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">SLICE A SPHERE</span><h3>The section shrinks away from the center.</h3><p>For sphere radius 5, the slice obeys r² + h² = 25. A rotating semicircle builds the same solid.</p><RangeControl label="Slice height h" display={number(height)} value={height} min={-5} max={5} step={.5} onChange={setHeight} /><div className="advanced-metric-grid"><span><small>SLICE RADIUS</small><strong>{number(radius)}</strong></span><span><small>SLICE AREA</small><strong>{number(Math.PI * radius ** 2)}</strong></span></div></div></div>;
}

function ComplexNumberLab() {
  const [real, setReal] = useState(3);
  const [imaginary, setImaginary] = useState(2);
  const original = svgPoint({ x: real, y: imaginary });
  const rotated = svgPoint({ x: -imaginary, y: real });
  return <div className="advanced-tool-workspace complex-workspace"><div className="advanced-tool-visual"><Axes><defs><marker id="complex-arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" /></marker></defs><line className="complex-original" x1="160" y1="125" x2={original.x} y2={original.y} markerEnd="url(#complex-arrow)" /><line className="complex-rotated" x1="160" y1="125" x2={rotated.x} y2={rotated.y} markerEnd="url(#complex-arrow)" /><text x={original.x + 8} y={original.y - 8}>z</text><text x={rotated.x + 8} y={rotated.y - 8}>iz</text></Axes></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">COMPLEX PLANE</span><h3>Multiplying by i rotates 90°.</h3><p>z = a + bi becomes iz = −b + ai. The magnitude stays fixed while the direction changes.</p><RangeControl label="Real part a" display={real} value={real} min={-4} max={4} step={1} onChange={setReal} /><RangeControl label="Imaginary part b" display={imaginary} value={imaginary} min={-4} max={4} step={1} onChange={setImaginary} /><div className="advanced-metric-grid"><span><small>z</small><strong>{real} {imaginary < 0 ? "−" : "+"} {Math.abs(imaginary)}i</strong></span><span><small>i · z</small><strong>{-imaginary} {real < 0 ? "−" : "+"} {Math.abs(real)}i</strong></span><span><small>|z|</small><strong>{number(Math.hypot(real, imaginary))}</strong></span></div></div></div>;
}

function PolynomialIdentityLab() {
  const [x, setX] = useState(3);
  const total = (x + 2) ** 2;
  return <div className="advanced-tool-workspace identity-workspace"><div className="identity-stage" role="img" aria-label={`Area model showing that ${x + 2} squared equals ${x} squared plus 4 times ${x} plus 4`}><div className="identity-square"><span className="identity-x2" style={{ flex: `${x} ${x} 0` }}>x²<br /><b>{x ** 2}</b></span><span className="identity-2x-vertical">2x<br /><b>{2 * x}</b></span><span className="identity-2x-horizontal">2x<br /><b>{2 * x}</b></span><span className="identity-four">4</span></div></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">IDENTITY AS AREA</span><h3>(x + 2)² = x² + 4x + 4</h3><p>The four pieces always rebuild the same square, so the equality is true for every x.</p><RangeControl label="Side part x" display={x} value={x} min={1} max={6} step={1} onChange={setX} /><div className="advanced-live-value"><small>BOTH SIDES</small><strong>({x}+2)² = {x ** 2}+{4 * x}+4 = {total}</strong></div></div></div>;
}

function DecisionLab() {
  const [probability, setProbability] = useState(.3);
  const [payoff, setPayoff] = useState(30);
  const sure = 8;
  const riskyExpected = probability * payoff;
  const better = riskyExpected > sure ? "Risky option" : riskyExpected < sure ? "Sure option" : "Equal expected value";
  return <div className="advanced-tool-workspace decision-workspace"><div className="decision-stage" aria-label={`${better}; sure expected value ${sure}, risky expected value ${number(riskyExpected)}`}><div><small>SURE</small><strong>${sure}</strong><i style={{ width: `${sure / 30 * 100}%` }} /></div><div><small>RISKY · {Math.round(probability * 100)}% OF ${payoff}</small><strong>${number(riskyExpected)} EV</strong><i style={{ width: `${Math.min(100, riskyExpected / 30 * 100)}%` }} /></div><b>{better}</b></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">COMPARE STRATEGIES</span><h3>Expected value is probability × payoff.</h3><p>Use EV for repeated choices. For one high-stakes choice, also name the risk and what the model leaves out.</p><RangeControl label="Win probability" display={`${Math.round(probability * 100)}%`} value={probability} min={.1} max={.9} step={.1} onChange={setProbability} /><RangeControl label="Risky payoff" display={`$${payoff}`} value={payoff} min={5} max={50} step={5} onChange={setPayoff} /><div className="advanced-live-value"><small>HIGHER LONG-RUN VALUE</small><strong>{better}</strong></div></div></div>;
}

function ScaleLab({ lesson }: { lesson: LessonDefinition }) {
  const [scale, setScale] = useState(1.5);
  const width = 58 * scale;
  const height = 44 * scale;
  return <div className="advanced-tool-workspace"><div className="scale-stage" role="img" aria-label={`Original triangle and a similar triangle scaled by ${number(scale)}`}><svg viewBox="0 0 320 250"><polygon className="scale-original" points="55,190 120,190 86,135" /><polygon className="scale-result" points={`180,190 ${180 + width},190 ${180 + width / 2},${190 - height}`} /><line x1="86" y1="135" x2={180 + width / 2} y2={190 - height} /><text x="53" y="218">original</text><text x="183" y="218">k = {number(scale)}</text></svg></div><div className="advanced-tool-panel"><span className="advanced-tool-tag">MEASURE · TRANSFORM · COMPARE</span><h3>{lesson.grade === 10 ? "What changes under this transformation?" : "Scale links every dimension."}</h3><p>Angles stay fixed under dilation. Length uses k, area uses k², and volume uses k³.</p><RangeControl label="Scale factor k" display={number(scale)} value={scale} min={.5} max={2.5} step={.25} onChange={setScale} /><div className="advanced-metric-grid"><span><small>LENGTH</small><strong>×{number(scale)}</strong></span><span><small>AREA</small><strong>×{number(scale ** 2)}</strong></span><span><small>VOLUME</small><strong>×{number(scale ** 3)}</strong></span></div></div></div>;
}
