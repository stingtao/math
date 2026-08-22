import Image from "next/image";
import { GoogleSignIn } from "./components/GoogleSignIn";
import { PublicHeader } from "./components/Header";
import { TopicIcon } from "./components/TopicIcon";
import { curriculumStats, gradeCurricula } from "@/lib/curriculum";

export const dynamic = "force-dynamic";

const learningLoop = [
  { number: "01", title: "See the idea", copy: "Start with a focused visual, then keep one sentence worth remembering.", visual: "fraction-bars", accent: "gold" as const, meta: "about 2 minutes" },
  { number: "02", title: "Try five checks", copy: "Use a hint when you need it. Correct every miss without losing your place.", visual: "equation-steps", accent: "teal" as const, meta: "no countdown" },
  { number: "03", title: "Unlock the trail", copy: "Earn stars, revisit weak ideas, and open a mixed boss after four lessons.", visual: "line-graph", accent: "violet" as const, meta: "progress that stays" },
];

const questPreview = [
  { title: "Read symbols", visual: "symbols", accent: "blue" as const },
  { title: "Move around zero", visual: "number-line", accent: "coral" as const },
  { title: "Predict the sign", visual: "sign-grid", accent: "coral" as const },
  { title: "Choose the first step", visual: "steps", accent: "blue" as const },
];

const gradeVisuals = {
  7: { visual: "ratio-table", accent: "coral" as const },
  8: { visual: "coordinate-plane", accent: "blue" as const },
  9: { visual: "parabola", accent: "violet" as const },
};

const mathWorldScenes = [
  { grade: 8, title: "Read the instruction first", copy: "Move through a deliberate operation sequence so grouping, powers, multiplication, and addition happen in the right order.", image: "/visuals/operations-sequence-context.jpg", lesson: "order-of-operations", visual: "steps", accent: "blue" as const },
  { grade: 8, title: "Opposite directions", copy: "Use a building to see why positive and negative positions share the same zero.", image: "/visuals/signed-numbers-context.png", lesson: "signed-numbers", visual: "number-line", accent: "blue" as const },
  { grade: 8, title: "Different pieces, same amount", copy: "Line up equal wholes to see why six eighths and three fourths name the same length.", image: "/visuals/fraction-workshop-context.jpg", lesson: "fractions", visual: "fraction-bars", accent: "gold" as const },
  { grade: 8, title: "Put the value in its place", copy: "Insert one known value into every matching variable slot, then evaluate the operations in order.", image: "/visuals/substitution-machine-context.jpg", lesson: "substitution", visual: "substitute", accent: "teal" as const },
  { grade: 8, title: "Four factors, one power", copy: "Gather repeated copies of the same base, then use the exponent as a compact factor count.", image: "/visuals/exponent-lab-context.jpg", lesson: "powers", visual: "powers", accent: "violet" as const },
  { grade: 7, title: "Every face counts", copy: "Unfold a package, match every face, and turn a solid into areas you can add.", image: "/visuals/surface-area-packaging-context.jpg", lesson: "g7-surface-area", visual: "net", accent: "coral" as const },
  { grade: 8, title: "Two questions, four groups", copy: "Sort one survey by two categories, then compare groups using the right total.", image: "/visuals/two-way-survey-context.jpg", lesson: "two-way-tables", visual: "two-way", accent: "gold" as const },
  { grade: 7, title: "Chance happens in stages", copy: "Follow two independent events and see why their probabilities multiply.", image: "/visuals/compound-events-lab-context.jpg", lesson: "g7-compound-events", visual: "tree", accent: "violet" as const },
  { grade: 9, title: "The same fraction remains", copy: "Watch stored energy shrink by one fixed multiplier at every step.", image: "/visuals/exponential-decay-energy-context.jpg", lesson: "g9-exponential-decay", visual: "decay", accent: "teal" as const },
  { grade: 7, title: "Interest grows in equal steps", copy: "Separate the starting principal from the same simple-interest addition earned each year.", image: "/visuals/simple-interest-growth-context.jpg", lesson: "g7-simple-interest", visual: "formula", accent: "gold" as const },
  { grade: 8, title: "Start at b, then follow m", copy: "Plot the intercept first, then repeat one rise-and-run step to build a straight line.", image: "/visuals/graphing-line-city-context.jpg", lesson: "graphing-lines", visual: "line-graph", accent: "blue" as const },
  { grade: 8, title: "x first, then y", copy: "Begin at the origin, move horizontally with x, and finish vertically with y to locate one point.", image: "/visuals/coordinate-route-context.jpg", lesson: "coordinate-plane", visual: "coordinate", accent: "blue" as const },
  { grade: 8, title: "One input, one destination", copy: "Follow each route through a rule and see why a function never sends one input two ways.", image: "/visuals/function-routing-context.jpg", lesson: "function-rules", visual: "mapping", accent: "teal" as const },
  { grade: 8, title: "Same shape, one scale factor", copy: "Project every vertex from one center and enlarge all corresponding sides consistently.", image: "/visuals/dilation-studio-context.jpg", lesson: "dilations-similarity", visual: "dilation", accent: "coral" as const },
  { grade: 8, title: "Three ways two lines can relate", copy: "See why a system can have one solution, no solution, or infinitely many shared points.", image: "/visuals/solution-cases-gallery-context.jpg", lesson: "solution-types", visual: "solution-types", accent: "blue" as const },
  { grade: 7, title: "A boundary and every value beyond it", copy: "See how an open or closed point sets the edge while an arrow shows the entire solution set.", image: "/visuals/inequality-trail-context.jpg", lesson: "g7-inequalities-g7", visual: "inequality-line", accent: "coral" as const },
  { grade: 9, title: "Measure every miss from the line", copy: "Use vertical residual distances to judge whether a fitted line captures the data pattern.", image: "/visuals/residual-observatory-context.jpg", lesson: "g9-correlation-residuals", visual: "residual", accent: "violet" as const },
  { grade: 8, title: "Only matching terms combine", copy: "Sort square terms, linear terms, and constants into matching families before combining their coefficients.", image: "/visuals/like-terms-sorting-context.jpg", lesson: "combining-like-terms", visual: "term-groups", accent: "blue" as const },
  { grade: 8, title: "Zoom in, then follow the loop", copy: "See place values become finer through each magnifying step, then trace the block that repeats without ending.", image: "/visuals/decimal-pattern-context.jpg", lesson: "repeating-decimals", visual: "decimal", accent: "violet" as const },
  { grade: 7, title: "Center and spread tell the story", copy: "Compare a typical value and the amount of variation instead of judging two groups by one number.", image: "/visuals/distribution-comparison-context.jpg", lesson: "g7-compare-distributions", visual: "box-plots", accent: "teal" as const },
];

const expandedSceneCount = 107;

export default function Home() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  return <main className="site-shell">
    <PublicHeader />

    <section className="hero" id="top">
      <div className="hero-copy">
        <span className="eyebrow">MATH · GRADES 7–9</span>
        <h1>Small steps.<br />Real math progress.</h1>
        <p>See one idea, work one example, and finish five focused questions. Every correction moves you forward.</p>
        <div className="hero-actions"><a className="primary-button" href="/learn?grade=8&demo=1">Try a lesson <span aria-hidden="true">→</span></a><a className="text-link" href="#story">Why I made this</a></div>
        <div className="hero-proof" aria-label="Course contents"><div><strong>{curriculumStats.grades}</strong><span>grade paths</span></div><div><strong>{curriculumStats.lessons}</strong><span>short lessons</span></div><div><strong>{curriculumStats.questions}</strong><span>practice checks</span></div></div>
      </div>
      <div className="hero-art" aria-label="A visual math trail from number lines and fractions to graphs, geometry, and an achievement star">
        <div className="hero-art-frame"><Image src="/visuals/math-trail-hero.png" width={1280} height={853} priority sizes="(max-width: 860px) 100vw, 48vw" alt="A paper-cut math trail with a number line, fraction model, graph, triangle, and achievement star" /></div>
        <span className="hero-float hero-float-time"><b>6–8</b><small>minutes</small></span>
        <span className="hero-float hero-float-practice"><b>5</b><small>quick checks</small></span>
        <span className="hero-float hero-float-boss"><b>★</b><small>boss unlocked</small></span>
      </div>
    </section>

    <section className="learning-loop-section" aria-labelledby="learning-loop-title">
      <div className="section-heading split-heading"><div><span className="section-kicker">A CALM LEARNING LOOP</span><h2 id="learning-loop-title">Know what to do next.</h2></div><p>Each lesson uses the same short rhythm, so your attention stays on the math—not on finding the next button.</p></div>
      <div className="learning-loop-grid">{learningLoop.map((item) => <article className={`loop-card accent-${item.accent}`} key={item.number}><div className="loop-card-top"><span>{item.number}</span><TopicIcon visual={item.visual} accent={item.accent} size="lg" label={`${item.title} illustration`} /></div><h3>{item.title}</h3><p>{item.copy}</p><small>{item.meta}</small></article>)}</div>
    </section>

    <section className="game-loop-section" aria-labelledby="game-loop-title">
      <div className="section-heading split-heading"><div><span className="section-kicker">PROGRESS YOU CAN SEE</span><h2 id="game-loop-title">Every small win opens something.</h2></div><p>Lessons collect quest keys. Corrections charge progress. Four keys open a mixed boss—with no timer and unlimited retries.</p></div>
      <div className="game-loop-board">
        <div className="game-quest-card accent-blue">
          <header><div><span className="section-kicker">REGION 01 · NUMBER FOUNDATIONS</span><h3>Four lesson keys, then the boss.</h3></div><strong>3 / 4</strong></header>
          <div className="game-quest-path" aria-label="Three of four lesson keys collected; one lesson and the boss remain">
            {questPreview.map((item, index) => <div className={index < 3 ? "collected" : "next"} key={item.title}><TopicIcon visual={item.visual} accent={item.accent} size="sm" label="" /><span aria-hidden="true">{index < 3 ? "✓" : index + 1}</span><small>{item.title}</small></div>)}
            <i aria-hidden="true" />
            <div className="game-boss-node"><b aria-hidden="true">★</b><small>Mixed boss</small></div>
          </div>
          <footer><span><b>ONE STEP LEFT</b> Corrections still collect the key.</span><span className="game-xp-chip">+40 XP</span></footer>
        </div>
        <div className="game-feedback-stack">
          <article className="game-feedback-card game-correction-card"><span aria-hidden="true">↻</span><div><small>RECOVERY COUNTS</small><h3>Not yet becomes now I see it.</h3><p>Use a hint, correct the step, and keep moving.</p></div><strong>✓</strong></article>
          <article className="game-feedback-card game-stars-card"><span aria-hidden="true">✦</span><div><small>STARS EXPLAIN THE RUN</small><h3>Completion is always one star.</h3><p>First tries and no-hint runs add mastery stars and one-time bonus XP; they never lock the next lesson.</p></div><strong>★★★</strong></article>
          <article className="game-feedback-card game-review-card"><span aria-hidden="true">◇</span><div><small>MEMORY PATH</small><h3>Review returns at the right time.</h3><p>Up to five questions revisit useful ideas after 1, 3, 7, and 14 days.</p></div><strong>1·3·7·14</strong></article>
        </div>
      </div>
    </section>

    <section className="math-world-section" aria-labelledby="math-world-title">
      <div className="section-heading split-heading"><div><span className="section-kicker">MATH IN THE WORLD · GRADES 7–9</span><h2 id="math-world-title">See the reason before the rule.</h2></div><p>Every lesson has a recognizable topic marker. Hard-to-picture ideas add a full visual scene before the exact math.</p></div>
      <div className="math-world-mobile-cue" aria-hidden="true"><span><b>{mathWorldScenes.length}</b> visual lessons</span><span>Swipe to explore <i>→</i></span></div>
      <div className="math-world-grid" role="region" aria-label={`${mathWorldScenes.length} visual lesson examples`}>{mathWorldScenes.map((scene, index) => <a className={`math-world-card accent-${scene.accent} scene-${index + 1}`} href={`/learn/${scene.lesson}?grade=${scene.grade}&demo=1`} key={scene.lesson}><div className="math-world-image"><Image src={scene.image} width={1200} height={800} sizes="(max-width: 760px) 86vw, (max-width: 1100px) 46vw, 520px" loading="lazy" decoding="async" alt="" /><span><TopicIcon visual={scene.visual} accent={scene.accent} size="md" label="" /></span></div><div className="math-world-copy"><small>GRADE {scene.grade} · EXPLORE A 6–8 MINUTE LESSON</small><h3>{scene.title}</h3><p>{scene.copy}</p><strong>See this idea <span aria-hidden="true">→</span></strong></div></a>)}</div>
      <div className="math-world-proof"><div className="math-world-proof-stats" aria-label={`${curriculumStats.lessons} topic icons and ${expandedSceneCount} full scenes`}><span><strong>{curriculumStats.lessons}/{curriculumStats.lessons}</strong><small>topic icons</small></span><span><strong>{expandedSceneCount}</strong><small>full scenes</small></span></div><span><b>Every lesson has a distinct visual topic marker.</b> Expanded context scenes build intuition, while exact diagrams and math stay readable on every screen.</span><i aria-hidden="true">✓</i></div>
    </section>

    <section className="founder-section" id="story">
      <div className="founder-mark" aria-hidden="true">S</div>
      <div><span className="section-kicker">WHY THIS EXISTS</span><h2>Hi, I’m Sting. I’m a parent, and I like math.</h2><p>My child needs to learn math, so I made a quiet place to explain, practice, and review it.</p><p>Try it. If something is unclear, leave an anonymous note on the <a href="/feedback">feedback board</a>. I’ll see what I can improve.</p></div>
    </section>

    <section className="curriculum-section" id="curriculum">
      <div className="section-heading split-heading"><div><span className="section-kicker">CHOOSE A GRADE</span><h2>Grades 7, 8, and 9</h2></div><p>Four lessons, then one mixed check. Google is only for saving progress.</p></div>
      <div className="grade-cards">{gradeCurricula.map((curriculum) => {
        const lessonCount = curriculum.regions.reduce((total, region) => total + region.lessons.length, 0);
        const gradeVisual = gradeVisuals[curriculum.grade];
        return <article className={`grade-card grade-${curriculum.grade} accent-${gradeVisual.accent}`} key={curriculum.grade}><div className="grade-card-visual"><TopicIcon visual={gradeVisual.visual} accent={gradeVisual.accent} size="lg" label={`Grade ${curriculum.grade} math topics`} /><span>GRADE <strong>{curriculum.grade}</strong></span></div><h3>{curriculum.subtitle}</h3><p>{lessonCount} lessons · {curriculum.regions.length} mixed checks</p><a href={`/learn?grade=${curriculum.grade}&demo=1`}>Open Grade {curriculum.grade} <span>→</span></a></article>;
      })}</div>
      <div className="region-grid compact-region-grid">{gradeCurricula.flatMap((curriculum) => curriculum.regions.slice(0, 2).map((region) => <article className={`region-card accent-${region.accent}`} key={region.id}><div className="region-card-top"><span className="region-index">G{curriculum.grade} · {String(region.order).padStart(2, "0")}</span><TopicIcon visual={region.lessons[0].visual} accent={region.accent} size="md" label={`${region.title} topic icon`} /></div><h3>{region.title}</h3><p>{region.subtitle}</p><span className="region-meta">4 lessons · 1 mixed check</span></article>))}</div>
    </section>

    <section className="privacy-section">
      <div className="privacy-visual" aria-hidden="true"><span className="privacy-orbit">✦</span><div><i /><i /><i /></div></div>
      <div className="privacy-copy"><span className="section-kicker">SIMPLE AND ANONYMOUS</span><h2>I don’t want to know who owns each score.</h2><p>Google helps you return. Math does not save your Google name, email, photo, or original account ID.</p><p>The leaderboard shows only a random nickname, abstract avatar, rank, and weekly XP.</p><ul><li>Ads stay separate from learning records</li><li>No searchable profiles</li><li>Leaderboard is opt-in</li><li>Feedback is separate from progress</li></ul><a className="text-link" href="/privacy">Read the privacy page</a></div>
    </section>

    <section className="join-section" id="join">
      <div className="join-copy"><span className="section-kicker">SAVE FOR NEXT TIME</span><h2>Google is only for returning.</h2><p>You receive a random nickname and abstract avatar. Google profile details are not saved.</p><p>Or <a href="/learn?grade=8&demo=1">try the demo</a>.</p></div>
      <div className="join-card"><span className="join-star" aria-hidden="true">✦</span><h3>Continue with Google</h3><p>For learners age 13 or older in this first version.</p><GoogleSignIn clientId={clientId} /></div>
    </section>
  </main>;
}
