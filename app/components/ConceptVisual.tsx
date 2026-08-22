import type { LessonDefinition } from "@/lib/curriculum";
import Image from "next/image";
import katex from "katex";

type ContextScene = {
  src: string;
  alt: string;
  headline: string;
  copy: string;
  model: "number-line" | "percent" | "slope" | "triangle" | "angles" | "scatter" | "distribute" | "function" | "transform" | "volume" | "cone-volume" | "balance" | "root-bracket" | "scientific-scale" | "equation-steps" | "ratio" | "circle" | "prism" | "probability-scale" | "systems-crossing" | "area-product" | "parabola" | "exponential" | "scale-drawing" | "random-sample" | "arithmetic-sequence" | "quadratic-roots" | "surface-area-net" | "compound-event" | "two-way-table" | "exponential-decay";
};

const contextScenes: Record<string, ContextScene> = {
  "signed-numbers": {
    src: "/visuals/signed-numbers-context.png",
    alt: "A building with floors above and below street level, showing positive and negative positions around a central reference",
    headline: "street level works like zero",
    copy: "Above and below are opposite directions from the same reference point.",
    model: "number-line",
  },
  percent: {
    src: "/visuals/percent-market-context.jpg",
    alt: "A market display with a highlighted part of a larger wall of equal tiles",
    headline: "20% means 20 out of 100",
    copy: "A percent compares one part with a whole split into one hundred equal parts.",
    model: "percent",
  },
  "slope-rate": {
    src: "/visuals/slope-trail-context.jpg",
    alt: "A cycling trail rising diagonally across a mountain landscape",
    headline: "slope = rise ÷ run",
    copy: "Compare the vertical change with the horizontal change to describe the trail.",
    model: "slope",
  },
  "pythagorean-theorem": {
    src: "/visuals/pythagorean-city-context.jpg",
    alt: "Three park routes forming a right triangle across a blue canal",
    headline: "a² + b² = c²",
    copy: "For a right triangle, the two shorter sides determine the diagonal shortcut.",
    model: "triangle",
  },
  "scatter-plots": {
    src: "/visuals/scatter-field-context.jpg",
    alt: "A greenhouse experiment with plants of varied heights under grow lights",
    headline: "look for the overall pattern",
    copy: "Each point is one observation. Together, the points can reveal a relationship.",
    model: "scatter",
  },
  "distributive-property": {
    src: "/visuals/distributive-workshop-context.jpg",
    alt: "Four identical workshop trays, each split into one group of blue gears and one group of two coral parts",
    headline: "4(x + 2) = 4x + 8",
    copy: "Four copies of a whole group means four copies of every part inside it.",
    model: "distribute",
  },
  "function-representations": {
    src: "/visuals/function-kiosk-context.jpg",
    alt: "A bike-rental rule machine connecting inputs with a route, a table, and a bar display",
    headline: "one function, many representations",
    copy: "A rule, table, graph, and real situation can all describe the same relationship.",
    model: "function",
  },
  "coordinate-transformations": {
    src: "/visuals/transform-plaza-context.jpg",
    alt: "Congruent triangular sculptures slid, reflected, and rotated across a tiled plaza",
    headline: "every point follows the same rule",
    copy: "A coordinate rule moves each vertex predictably while preserving the figure.",
    model: "transform",
  },
  "cylinder-volume": {
    src: "/visuals/cylinder-tank-context.jpg",
    alt: "A transparent cylindrical water tank filling upward in equal layers with radius and height guides",
    headline: "V = πr²h",
    copy: "Find the circular base area, then stack that area through the full height.",
    model: "volume",
  },
  "one-step-equations": {
    src: "/visuals/equation-balance-context.jpg",
    alt: "A level balance with one mystery box and three gold cubes on the left, and seven matching cubes on the right",
    headline: "x + 3 = 7 → x = 4",
    copy: "Remove the same amount from both sides to keep the equation balanced.",
    model: "balance",
  },
  "approximating-irrationals": {
    src: "/visuals/irrational-garden-context.jpg",
    alt: "A two-by-four rectangular garden crossed by a diagonal coral measuring cable",
    headline: "4 < √20 < 5",
    copy: "Bracket a root between the square roots of its neighboring perfect squares.",
    model: "root-bracket",
  },
  "scientific-notation": {
    src: "/visuals/scientific-observatory-context.jpg",
    alt: "An observatory sightline passing through shrinking scale rings toward a distant planet",
    headline: "4,500,000 = 4.5 × 10⁶",
    copy: "Move the decimal to make one leading digit, then count the places.",
    model: "scientific-scale",
  },
  "multi-step-equations": {
    src: "/visuals/multistep-workshop-context.jpg",
    alt: "A workshop sequence removing outer sleeves from two identical mystery boxes one layer at a time",
    headline: "2(x + 3) = 14 → x = 4",
    copy: "Simplify the outer layers, then undo operations in reverse order.",
    model: "equation-steps",
  },
  "g7-unit-rates": {
    src: "/visuals/unit-rate-bike-context.jpg",
    alt: "Three rental bicycles beside a route divided into equal travel sections and one highlighted single-bike comparison",
    headline: "180 miles ÷ 3 hours = 60 mi/h",
    copy: "Divide both quantities by the same value to find the amount for one unit.",
    model: "ratio",
  },
  "g7-circle-measures": {
    src: "/visuals/circle-fountain-context.jpg",
    alt: "A circular city fountain with a center point, radius path, diameter path, and outer ring",
    headline: "C = 2πr · A = πr²",
    copy: "The radius controls both the distance around a circle and the space inside it.",
    model: "circle",
  },
  "g7-prism-volume": {
    src: "/visuals/prism-packing-context.jpg",
    alt: "A transparent rectangular packing box built from three matching layers of gold parcels",
    headline: "V = Bh",
    copy: "Find one base layer, then stack that same area through the prism’s height.",
    model: "prism",
  },
  "g7-probability-scale": {
    src: "/visuals/probability-arcade-context.jpg",
    alt: "A four-section spinner, a die, and repeated trial tokens at a modern probability arcade",
    headline: "0 ≤ P(event) ≤ 1",
    copy: "Probability moves from impossible at zero to certain at one.",
    model: "probability-scale",
  },
  "g9-systems-by-graphing-g9": {
    src: "/visuals/systems-transit-context.jpg",
    alt: "Two straight transit routes crossing at one shared gold station",
    headline: "the intersection satisfies both equations",
    copy: "A solution to a system is the point that lies on both lines at once.",
    model: "systems-crossing",
  },
  "g9-multiply-binomials": {
    src: "/visuals/polynomial-tiles-context.jpg",
    alt: "One rectangular algebra tile board divided into four aligned product regions",
    headline: "(x + 2)(x + 3) = x² + 5x + 6",
    copy: "Every part of one side multiplies every part of the other side.",
    model: "area-product",
  },
  "g9-quadratic-graphs": {
    src: "/visuals/parabola-bridge-context.jpg",
    alt: "A symmetric bridge arch centered on a vertical gold line",
    headline: "y = x² − 4",
    copy: "A quadratic graph is symmetric around its axis and turns at its vertex.",
    model: "parabola",
  },
  "g9-exponential-growth": {
    src: "/visuals/exponential-greenhouse-context.jpg",
    alt: "Four greenhouse trays with one, two, four, and eight glowing plants",
    headline: "1, 2, 4, 8, 16, …",
    copy: "Equal multiplicative changes create growth that speeds up over time.",
    model: "exponential",
  },
  "g7-scale-drawings": {
    src: "/visuals/scale-drawing-studio-context.jpg",
    alt: "A blueprint and a finished miniature building showing the same footprint at proportional sizes",
    headline: "1 cm : 4 m · 6 cm represents 24 m",
    copy: "A scale drawing multiplies every matching length by the same scale factor.",
    model: "scale-drawing",
  },
  "g7-random-samples": {
    src: "/visuals/random-sample-context.jpg",
    alt: "A sampling machine drawing a mixed group of colored pieces from a much larger population",
    headline: "random selection reduces bias",
    copy: "Give every member a fair chance so the sample can represent the whole population.",
    model: "random-sample",
  },
  "g9-arithmetic-sequences": {
    src: "/visuals/arithmetic-sequence-context.jpg",
    alt: "An architectural stair installation gaining an equal group of blocks on every new tier",
    headline: "4, 7, 10, 13, … adds 3 each time",
    copy: "A constant difference builds an arithmetic sequence one equal step at a time.",
    model: "arithmetic-sequence",
  },
  "g9-quadratic-formula": {
    src: "/visuals/quadratic-roots-context.jpg",
    alt: "A symmetric parabolic arc meeting a horizontal field at two highlighted points",
    headline: "x² − 2x − 3 = 0 → x = −1 or 3",
    copy: "The quadratic formula finds the x-values where a parabola meets the horizontal axis.",
    model: "quadratic-roots",
  },
  "g7-surface-area": {
    src: "/visuals/surface-area-packaging-context.jpg",
    alt: "A rectangular box net beside its folded box with matching face colors and alignment guides",
    headline: "a 2 × 3 × 4 box has surface area 52",
    copy: "List every outer face once, pair matching faces, then add all their areas.",
    model: "surface-area-net",
  },
  "g7-compound-events": {
    src: "/visuals/compound-events-lab-context.jpg",
    alt: "A two-stage probability station sending a coin-like token toward six possible second outcomes",
    headline: "head and roll 6 → 1/2 × 1/6 = 1/12",
    copy: "For independent events joined by “and,” multiply the probability of each stage.",
    model: "compound-event",
  },
  "two-way-tables": {
    src: "/visuals/two-way-survey-context.jpg",
    alt: "Survey tokens sorted into four compartments by color and shape",
    headline: "18 of 30 students = 60%",
    copy: "A joint count sits where two categories meet; divide by the correct total to compare groups.",
    model: "two-way-table",
  },
  "g9-exponential-decay": {
    src: "/visuals/exponential-decay-energy-context.jpg",
    alt: "Four connected energy reservoirs holding a smaller fixed fraction at each step",
    headline: "120, 60, 30, 15, … multiplies by 1/2",
    copy: "Exponential decay keeps the same multiplier between zero and one at every step.",
    model: "exponential-decay",
  },
  "g7-discount-markup": {
    src: "/visuals/discount-studio-context.jpg",
    alt: "A product box beside one price strip split into five equal panels, with one coral panel and four gold panels",
    headline: "20% off means keep 80%",
    copy: "One of five equal price shares is removed, so four of five shares remain to pay.",
    model: "percent",
  },
  "g7-angle-equations": {
    src: "/visuals/angle-plaza-context.jpg",
    alt: "Two paths crossing in a plaza with opposite angle sectors matched by color",
    headline: "x + 65° = 180°",
    copy: "Opposite angles are equal. Adjacent angles on a straight line add to 180°.",
    model: "angles",
  },
  "cone-volume": {
    src: "/visuals/cone-measure-context.jpg",
    alt: "Three congruent transparent cones beside a cylinder with the same base and height, showing three equal fills",
    headline: "V = ⅓πr²h",
    copy: "Three matching cones fill one cylinder with the same base and height, so one cone holds one third as much.",
    model: "cone-volume",
  },
  "g9-geometric-sequences": {
    src: "/visuals/geometric-sequence-lab-context.jpg",
    alt: "Four connected greenhouse trays holding one, two, four, and eight glowing plants",
    headline: "1, 2, 4, 8, … multiplies by 2",
    copy: "A constant ratio builds a geometric sequence by repeating the same multiplication.",
    model: "exponential",
  },
  "g9-absolute-value-equations": {
    src: "/visuals/absolute-transit-context.jpg",
    alt: "Two identical transit capsules parked at equal distances on opposite sides of one glowing zero marker",
    headline: "|x| = 4 → x = −4 or 4",
    copy: "Absolute value measures distance from zero, so the same positive distance can point in two directions.",
    model: "number-line",
  },
};

function mathFor(visual: string) {
  if (visual.includes("exponent") || visual === "powers" || visual === "parentheses") return "x^2\\cdot x^3=x^5";
  if (visual.includes("equation") || visual === "balance" || visual === "substitute") return "3x-4=11";
  if (visual.includes("distribut")) return "a(b+c)=ab+ac";
  if (visual.includes("root")) return "4<\\sqrt{20}<5";
  if (visual.includes("scientific")) return "4.5\\times 10^6";
  if (visual.includes("volume") || ["cylinder", "cone", "sphere", "solid-compare"].includes(visual)) return "V=\\pi r^2h";
  return "3x+5";
}

export function ConceptVisual({ lesson }: { lesson: LessonDefinition }) {
  const visual = lesson.visual;
  const contextScene = contextScenes[lesson.slug];
  if (contextScene) return <ContextLessonVisual scene={contextScene} />;
  if (visual.includes("fraction") || visual === "percent-grid" || visual === "place-value") {
    return <div className={`lesson-visual visual-${visual}`}><div className="fraction-model"><span /><span /><span className="empty" /><span className="empty" /></div><strong>{visual === "percent-grid" ? "25% = 25/100" : "3/4"}</strong><p>Equal-size parts make the relationship visible.</p></div>;
  }
  if (visual.includes("coordinate") || visual.includes("slope") || visual.includes("line") || visual.includes("scatter") || visual.includes("systems") || visual.includes("fit")) {
    return <div className={`lesson-visual visual-${visual}`}><div className="coordinate-model"><span className="axis-x" /><span className="axis-y" /><i className="point-one" /><i className="point-two" /><b /></div><strong>{visual.includes("slope") ? "rise / run" : "(x, y)"}</strong><p>Read the horizontal change before the vertical change.</p></div>;
  }
  if (visual.includes("triangle") || visual.includes("angle") || visual.includes("distance") || visual.includes("transform") || visual.includes("congruence") || visual.includes("dilation")) {
    return <div className={`lesson-visual visual-${visual}`}><div className="shape-model"><span /><span /><span /></div><strong>{visual.includes("triangle") ? "a² + b² = c²" : "same shape, clear rule"}</strong><p>Track what moves—and what must stay the same.</p></div>;
  }
  if (["cylinder", "cone", "sphere", "solid-compare"].includes(visual)) {
    return <div className={`lesson-visual visual-${visual}`}><div className="solid-model"><span /><i /></div><strong>V = base area × height</strong><p>Start with the familiar base, then build the solid.</p></div>;
  }
  if (visual === "number-line" || visual === "root-line") {
    return <div className={`lesson-visual visual-${visual}`}><div className="number-line-model"><span>−4</span><span>−2</span><i>0</i><span>2</span><span>4</span><b /></div><strong>right means greater</strong><p>Use direction before calculation.</p></div>;
  }
  return <div className={`lesson-visual visual-${visual}`}><div className="expression-model"><span dangerouslySetInnerHTML={{ __html: katex.renderToString(mathFor(visual), { throwOnError: false }) }} /><i>→</i><strong>{lesson.keyIdea.split(".")[0]}</strong></div><p>Read each structure before you calculate.</p></div>;
}

function ContextLessonVisual({ scene }: { scene: ContextScene }) {
  return (
    <div className={`lesson-visual contextual-lesson-visual context-model-${scene.model}`}>
      <div className="context-scene"><Image src={scene.src} width={1200} height={800} sizes="(max-width: 760px) 92vw, 720px" alt={scene.alt} /></div>
      <div className="context-math-card" aria-label={`Math model: ${scene.headline}`}>
        {scene.model === "number-line" && <div className="number-line-model context-number-line"><span>−4</span><span>−2</span><i>0</i><span>2</span><span>4</span><b /></div>}
        {scene.model === "percent" && <div className="percent-context-grid" aria-hidden="true">{Array.from({ length: 100 }, (_, index) => <span className={index < 20 ? "filled" : ""} key={index} />)}</div>}
        {scene.model === "slope" && <div className="coordinate-model context-coordinate"><span className="axis-x" /><span className="axis-y" /><i className="point-one" /><i className="point-two" /><b /><em className="slope-run">run</em><em className="slope-rise">rise</em></div>}
        {scene.model === "triangle" && <div className="shape-model context-triangle"><span /><span /><span /><i aria-hidden="true" /></div>}
        {scene.model === "angles" && <div className="angles-context-model" aria-hidden="true"><i className="angle-line-one" /><i className="angle-line-two" /><span className="angle-x">x°</span><span className="angle-65">65°</span><b>180°</b></div>}
        {scene.model === "scatter" && <div className="scatter-model" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>}
        {scene.model === "distribute" && <div className="distribute-context-model" aria-hidden="true"><span dangerouslySetInnerHTML={{ __html: katex.renderToString("4(x+2)", { throwOnError: false }) }} /><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("4x+8", { throwOnError: false }) }} /></div>}
        {scene.model === "function" && <div className="function-context-model" aria-hidden="true"><span><b>0</b><b>1</b><b>2</b></span><i>→</i><em>×2 + 1</em><i>→</i><span><b>1</b><b>3</b><b>5</b></span></div>}
        {scene.model === "transform" && <div className="transform-context-model" aria-hidden="true"><i className="transform-axis-x" /><i className="transform-axis-y" /><span className="transform-shape-one" /><span className="transform-shape-two" /><em>(+3, +2)</em></div>}
        {scene.model === "volume" && <div className="volume-context-model" aria-hidden="true"><span className="volume-shell" /><i className="volume-top" /><i className="volume-bottom" /><b className="volume-radius">r</b><b className="volume-height">h</b></div>}
        {scene.model === "cone-volume" && <div className="cone-volume-context-model" aria-hidden="true"><div className="cone-model-group"><span /><span /><span /></div><i>→</i><div className="cone-cylinder-model"><span /><b>3 × cone</b></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("V_{cone}=\\tfrac13\\pi r^2h", { throwOnError: false }) }} /></div>}
        {scene.model === "balance" && <div className="balance-context-model" aria-hidden="true"><div><span>x + 3</span><i>=</i><span>7</span></div><div><em>−3</em><b>same change</b><em>−3</em></div><strong>x = 4</strong></div>}
        {scene.model === "root-bracket" && <div className="root-bracket-context-model" aria-hidden="true"><span><small>√16</small><b>4</b></span><i><em>√20</em></i><span><small>√25</small><b>5</b></span></div>}
        {scene.model === "scientific-scale" && <div className="scientific-context-model" aria-hidden="true"><span>4,500,000</span><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("4.5\\times10^6", { throwOnError: false }) }} /><small>6 places</small></div>}
        {scene.model === "equation-steps" && <div className="equation-steps-context-model" aria-hidden="true">{["2(x + 3) = 14", "2x + 6 = 14", "2x = 8", "x = 4"].map((step, index) => <span key={step}><b>{step}</b>{index < 3 && <i>→</i>}</span>)}</div>}
        {scene.model === "ratio" && <div className="ratio-context-model" aria-hidden="true"><span><b>180</b><small>miles</small></span><i>÷</i><span><b>3</b><small>hours</small></span><i>=</i><strong><b>60</b><small>mi/h</small></strong></div>}
        {scene.model === "circle" && <div className="circle-context-model" aria-hidden="true"><span><i>r</i></span><div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("C=2\\pi r", { throwOnError: false }) }} /><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("A=\\pi r^2", { throwOnError: false }) }} /></div></div>}
        {scene.model === "prism" && <div className="prism-context-model" aria-hidden="true"><div><span /><span /><span /></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("V=B\\cdot h", { throwOnError: false }) }} /></div>}
        {scene.model === "probability-scale" && <div className="probability-context-model" aria-hidden="true"><div><span>0</span><i><b /></i><span>1</span></div><small>impossible</small><em>equally likely</em><small>certain</small></div>}
        {scene.model === "systems-crossing" && <div className="systems-context-model" aria-hidden="true"><i className="system-axis-x" /><i className="system-axis-y" /><span className="system-line-one" /><span className="system-line-two" /><b /><em>one shared solution</em></div>}
        {scene.model === "area-product" && <div className="area-product-context-model" aria-hidden="true"><div><span>x²</span><span>3x</span><span>2x</span><span>6</span></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("(x+2)(x+3)=x^2+5x+6", { throwOnError: false }) }} /></div>}
        {scene.model === "parabola" && <div className="parabola-context-model" aria-hidden="true"><i className="parabola-axis-x" /><i className="parabola-axis-y" /><span /><b dangerouslySetInnerHTML={{ __html: katex.renderToString("y=x^2-4", { throwOnError: false }) }} /></div>}
        {scene.model === "exponential" && <div className="exponential-context-model" aria-hidden="true">{[1, 2, 4, 8, 16].map((value, index) => <span style={{ height: `${24 + index * 16}px` }} key={value}><b>{value}</b></span>)}</div>}
        {scene.model === "scale-drawing" && <div className="scale-drawing-context-model" aria-hidden="true"><span><b>1 cm</b><small>drawing</small></span><i>:</i><span><b>4 m</b><small>real size</small></span><em>so</em><strong><b>6 cm</b><small>× 4 = 24 m</small></strong></div>}
        {scene.model === "random-sample" && <div className="random-sample-context-model" aria-hidden="true"><div className="sample-population"><small>population</small>{Array.from({ length: 20 }, (_, index) => <span data-group={index % 5} key={index} />)}</div><i>random draw</i><div className="sample-result"><small>sample</small>{[0, 3, 1, 4, 2].map((group, index) => <span data-group={group} key={`${group}-${index}`} />)}</div></div>}
        {scene.model === "arithmetic-sequence" && <div className="arithmetic-sequence-context-model" aria-hidden="true"><div>{[4, 7, 10, 13].map((value, index) => <span key={value}><b>{value}</b>{index < 3 && <i>+3</i>}</span>)}</div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("a_n=4+3(n-1)", { throwOnError: false }) }} /></div>}
        {scene.model === "quadratic-roots" && <div className="quadratic-roots-context-model" aria-hidden="true"><div><i className="root-axis-x" /><i className="root-axis-y" /><span className="root-parabola" /><b className="root-point root-point-one">−1</b><b className="root-point root-point-two">3</b></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("x^2-2x-3=0", { throwOnError: false }) }} /></div>}
        {scene.model === "surface-area-net" && <div className="surface-area-context-model" aria-hidden="true"><div className="surface-net"><span>8</span><span>6</span><span>8</span><span>6</span><span>12</span><span>12</span></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("2(6+8+12)=52", { throwOnError: false }) }} /></div>}
        {scene.model === "compound-event" && <div className="compound-event-context-model" aria-hidden="true"><span><small>head</small><b>1/2</b></span><i>×</i><span><small>roll 6</small><b>1/6</b></span><i>=</i><strong><small>together</small><b>1/12</b></strong></div>}
        {scene.model === "two-way-table" && <div className="two-way-context-model" aria-hidden="true"><table><thead><tr><th /><th>Tea</th><th>Other</th><th>Total</th></tr></thead><tbody><tr><th>Group A</th><td className="focus-cell">18</td><td>12</td><td className="focus-total">30</td></tr><tr><th>Group B</th><td>12</td><td>18</td><td>30</td></tr></tbody></table><strong>18 ÷ 30 = 60%</strong></div>}
        {scene.model === "exponential-decay" && <div className="exponential-decay-context-model" aria-hidden="true"><div>{[120, 60, 30, 15].map((value, index) => <span key={value}><b style={{ height: `${30 + value / 3}px` }}>{value}</b>{index < 3 && <i>× 1/2</i>}</span>)}</div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("y=120(\\tfrac12)^t", { throwOnError: false }) }} /></div>}
      </div>
      <strong>{scene.headline}</strong>
      <p>{scene.copy}</p>
    </div>
  );
}
