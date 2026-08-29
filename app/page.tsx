import Image from "next/image";
import { FrontierWorldExplorer } from "./components/FrontierWorldExplorer";
import { GoogleSignIn } from "./components/GoogleSignIn";
import { PublicHeader } from "./components/Header";
import { TopicIcon } from "./components/TopicIcon";
import { gradeCurricula } from "@/lib/curriculum";

export const dynamic = "force-dynamic";

const missionSteps = [
  { number: "01", title: "See one example", visual: "fraction-bars", accent: "gold" as const },
  { number: "02", title: "Try it yourself", visual: "coordinate-plane", accent: "blue" as const },
  { number: "03", title: "Use a clue and retry", visual: "equation-steps", accent: "teal" as const },
  { number: "04", title: "Clear a mixed check", visual: "line-graph", accent: "violet" as const },
];

const gradeVisuals = {
  7: { visual: "ratio-table", label: "Ratios & geometry", accent: "coral" as const },
  8: { visual: "coordinate-plane", label: "Linear relationships", accent: "blue" as const },
  9: { visual: "parabola", label: "Algebra I", accent: "violet" as const },
  10: { visual: "congruence", label: "Geometry & proof", accent: "coral" as const },
  11: { visual: "growth", label: "Algebra II", accent: "teal" as const },
  12: { visual: "curve-line", label: "Advanced math", accent: "gold" as const },
};

export default function Home() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";

  return (
    <main className="site-shell frontier-home">
      <PublicHeader />
      <FrontierWorldExplorer />

      <section className="frontier-mission-loop" id="story" aria-labelledby="mission-loop-title">
        <div className="frontier-section-heading frontier-heading-light">
          <span className="frontier-section-index">HOW IT WORKS</span>
          <div><p className="frontier-kicker">6–8 MINUTES</p><h2 id="mission-loop-title">One mission. Four moves.</h2></div>
          <p>See it, try it, fix it, prove it.</p>
        </div>
        <div className="frontier-loop-grid">
          {missionSteps.map((step) => (
            <article className={`frontier-loop-card accent-${step.accent}`} key={step.number}>
              <header><span>{step.number}</span><TopicIcon visual={step.visual} accent={step.accent} size="md" label="" /></header>
              <h3>{step.title}</h3>
            </article>
          ))}
        </div>
        <div className="frontier-loop-footer">
          <span aria-hidden="true">↻</span>
          <p><b>Hints and retries are built in.</b> A miss reveals one useful clue, then you try again.</p>
        </div>
      </section>

      <section className="frontier-field-test" aria-labelledby="field-test-title">
        <div className="frontier-field-visual">
          <Image src="/visuals/graphing-line-city-context.webp" alt="A line graph becoming a route through a future city" fill sizes="(max-width: 900px) 100vw, 52vw" loading="lazy" />
          <div className="frontier-coordinate-hud" aria-hidden="true"><span>(1, 2)</span><span>(2, 4)</span><span>(3, 6)</span><strong>y = 2x</strong></div>
        </div>
        <div className="frontier-field-copy">
          <span className="frontier-section-index">TRY IT NOW</span>
          <p className="frontier-kicker">LIVE GRAPH LAB</p>
          <h2 id="field-test-title">Plot it. Connect it. Read the line back.</h2>
          <p>Plot <b>(1, 2)</b>, <b>(2, 4)</b>, and <b>(3, 6)</b>. Connect the points—or type <b>y = 2x</b> and watch the line respond.</p>
          <a className="frontier-dark-button" href="/labs/linear-graphs#point-mission">Open the live Graph Lab <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="frontier-curriculum" id="curriculum" aria-labelledby="curriculum-title">
        <div className="frontier-section-heading">
          <span className="frontier-section-index">START HERE</span>
          <div><p className="frontier-kicker">GRADES 7–12</p><h2 id="curriculum-title">Choose your grade.</h2></div>
          <p>You can switch paths anytime.</p>
        </div>
        <div className="frontier-grade-grid">
          {gradeCurricula.map((curriculum) => {
            const gradeVisual = gradeVisuals[curriculum.grade];
            return (
              <a className={`frontier-grade-card accent-${gradeVisual.accent}`} href={`/learn?grade=${curriculum.grade}&demo=1`} key={curriculum.grade}>
                <header><TopicIcon visual={gradeVisual.visual} accent={gradeVisual.accent} size="md" label="" /><span>GRADE <b>{curriculum.grade}</b></span></header>
                <h3>{gradeVisual.label}</h3>
                <strong aria-hidden="true">→</strong>
              </a>
            );
          })}
        </div>
      </section>

      <section className="frontier-launch" id="join">
        <div className="frontier-launch-copy">
          <span className="frontier-kicker">START NOW</span>
          <h2>Play one short mission.</h2>
          <p>No sign-in required.</p>
          <a href="/learn?grade=8&demo=1">Start Grade 8 <span aria-hidden="true">→</span></a>
        </div>
        <div className="frontier-launch-card">
          <small>SAVE PROGRESS</small>
          <h3>Return with a codename.</h3>
          <GoogleSignIn clientId={clientId} />
          <span><a href="/privacy">Privacy details</a> · For learners age 13+</span>
        </div>
      </section>
    </main>
  );
}
