import type { LessonDefinition } from "@/lib/curriculum";
import Image from "next/image";
import katex from "katex";

type ContextScene = {
  src: string;
  alt: string;
  headline: string;
  copy: string;
  model: "number-line" | "percent" | "slope" | "triangle" | "scatter";
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
      </div>
      <strong>{scene.headline}</strong>
      <p>{scene.copy}</p>
    </div>
  );
}
