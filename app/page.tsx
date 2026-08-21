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

const gradeVisuals = {
  7: { visual: "ratio-table", accent: "coral" as const },
  8: { visual: "coordinate-plane", accent: "blue" as const },
  9: { visual: "parabola", accent: "violet" as const },
};

const mathWorldScenes = [
  { title: "Opposite directions", copy: "Use a building to see why positive and negative positions share the same zero.", image: "/visuals/signed-numbers-context.png", lesson: "signed-numbers", visual: "number-line", accent: "blue" as const },
  { title: "Rules that connect", copy: "Follow one bike-rental rule through a situation, table, graph, and equation.", image: "/visuals/function-kiosk-context.jpg", lesson: "function-representations", visual: "function-machine", accent: "teal" as const },
  { title: "The diagonal shortcut", copy: "Turn a route across the city into a right triangle you can measure.", image: "/visuals/pythagorean-city-context.jpg", lesson: "pythagorean-theorem", visual: "right-triangle", accent: "coral" as const },
  { title: "Volume in layers", copy: "See a cylinder as equal circular layers stacked through its height.", image: "/visuals/cylinder-tank-context.jpg", lesson: "cylinder-volume", visual: "cylinder", accent: "gold" as const },
];

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

    <section className="math-world-section" aria-labelledby="math-world-title">
      <div className="section-heading split-heading"><div><span className="section-kicker">MATH IN THE WORLD</span><h2 id="math-world-title">See the reason before the rule.</h2></div><p>Each part of Grade 8 has a visual landmark that turns an abstract idea into something you can picture.</p></div>
      <div className="math-world-grid">{mathWorldScenes.map((scene, index) => <a className={`math-world-card accent-${scene.accent} scene-${index + 1}`} href={`/learn/${scene.lesson}?grade=8&demo=1`} key={scene.lesson}><div className="math-world-image"><Image src={scene.image} width={1200} height={800} sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 520px" alt="" /><span><TopicIcon visual={scene.visual} accent={scene.accent} size="md" label="" /></span></div><div className="math-world-copy"><small>EXPLORE A 6–8 MINUTE LESSON</small><h3>{scene.title}</h3><p>{scene.copy}</p><strong>See this idea <span aria-hidden="true">→</span></strong></div></a>)}</div>
      <div className="math-world-proof"><strong>13 / 13</strong><span><b>Grade 8 regions now have a real-world visual landmark.</b> Exact diagrams and math stay clear and readable on every screen.</span><i aria-hidden="true">✓</i></div>
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
