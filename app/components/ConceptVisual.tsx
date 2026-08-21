import type { LessonDefinition } from "@/lib/curriculum";
import Image from "next/image";
import katex from "katex";

type ContextScene = {
  src: string;
  alt: string;
  headline: string;
  copy: string;
  model: "number-line" | "percent" | "slope" | "triangle" | "scatter" | "distribute" | "function" | "transform" | "volume" | "balance" | "root-bracket" | "scientific-scale" | "equation-steps";
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
        {scene.model === "scatter" && <div className="scatter-model" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>}
        {scene.model === "distribute" && <div className="distribute-context-model" aria-hidden="true"><span dangerouslySetInnerHTML={{ __html: katex.renderToString("4(x+2)", { throwOnError: false }) }} /><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("4x+8", { throwOnError: false }) }} /></div>}
        {scene.model === "function" && <div className="function-context-model" aria-hidden="true"><span><b>0</b><b>1</b><b>2</b></span><i>→</i><em>×2 + 1</em><i>→</i><span><b>1</b><b>3</b><b>5</b></span></div>}
        {scene.model === "transform" && <div className="transform-context-model" aria-hidden="true"><i className="transform-axis-x" /><i className="transform-axis-y" /><span className="transform-shape-one" /><span className="transform-shape-two" /><em>(+3, +2)</em></div>}
        {scene.model === "volume" && <div className="volume-context-model" aria-hidden="true"><span className="volume-shell" /><i className="volume-top" /><i className="volume-bottom" /><b className="volume-radius">r</b><b className="volume-height">h</b></div>}
        {scene.model === "balance" && <div className="balance-context-model" aria-hidden="true"><div><span>x + 3</span><i>=</i><span>7</span></div><div><em>−3</em><b>same change</b><em>−3</em></div><strong>x = 4</strong></div>}
        {scene.model === "root-bracket" && <div className="root-bracket-context-model" aria-hidden="true"><span><small>√16</small><b>4</b></span><i><em>√20</em></i><span><small>√25</small><b>5</b></span></div>}
        {scene.model === "scientific-scale" && <div className="scientific-context-model" aria-hidden="true"><span>4,500,000</span><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("4.5\\times10^6", { throwOnError: false }) }} /><small>6 places</small></div>}
        {scene.model === "equation-steps" && <div className="equation-steps-context-model" aria-hidden="true">{["2(x + 3) = 14", "2x + 6 = 14", "2x = 8", "x = 4"].map((step, index) => <span key={step}><b>{step}</b>{index < 3 && <i>→</i>}</span>)}</div>}
      </div>
      <strong>{scene.headline}</strong>
      <p>{scene.copy}</p>
    </div>
  );
}
