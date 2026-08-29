import Image from "next/image";
import { FrontierWorldExplorer } from "./components/FrontierWorldExplorer";
import { GoogleSignIn } from "./components/GoogleSignIn";
import { PublicHeader } from "./components/Header";
import { TopicIcon } from "./components/TopicIcon";
import { curriculumStats, gradeCurricula } from "@/lib/curriculum";
import { featuredFrontierWorlds } from "@/lib/frontier-worlds";

export const dynamic = "force-dynamic";

const missionSteps = [
  { number: "01", label: "SEE THE IDEA", title: "One example. One move to notice.", copy: "Start with a visual that makes the rule visible. No wall of text and no guessing what matters.", visual: "fraction-bars", accent: "gold" as const },
  { number: "02", label: "TAKE THE CONTROLS", title: "Do the math, do not just watch it.", copy: "Plot the point, move the line, enter the equation, or choose the next step yourself.", visual: "coordinate-plane", accent: "blue" as const },
  { number: "03", label: "REPAIR THE MISS", title: "Wrong answers open clues.", copy: "See what went off course, use a hint, try again, and recover points when you correct it.", visual: "equation-steps", accent: "teal" as const },
  { number: "04", label: "CLEAR THE BOSS", title: "Finish with a short checkpoint.", copy: "Mix what you learned, beat it now, or let the idea return later until it finally sticks.", visual: "line-graph", accent: "violet" as const },
];

const gradeVisuals = {
  7: { visual: "ratio-table", accent: "coral" as const },
  8: { visual: "coordinate-plane", accent: "blue" as const },
  9: { visual: "parabola", accent: "violet" as const },
  10: { visual: "congruence", accent: "coral" as const },
  11: { visual: "growth", accent: "teal" as const },
  12: { visual: "curve-line", accent: "gold" as const },
};

const expandedSceneCount = 124;

export default function Home() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";

  return (
    <main className="site-shell frontier-home">
      <PublicHeader />
      <FrontierWorldExplorer />

      <section className="frontier-manifesto" id="story" aria-labelledby="manifesto-title">
        <span className="frontier-section-index">01 · THE IDEA</span>
        <div>
          <p className="frontier-kicker">MATH PUSHES THE MAP FORWARD</p>
          <h2 id="manifesto-title">The next frontier is not built by memorizing a worksheet.</h2>
        </div>
        <p>It is built by noticing patterns, testing ideas, correcting misses, and trying again. Those are math skills—and explorer skills.</p>
      </section>

      <section className="frontier-world-gallery" aria-labelledby="world-gallery-title">
        <div className="frontier-section-heading">
          <span className="frontier-section-index">02 · CHOOSE A WORLD</span>
          <div><p className="frontier-kicker">THREE FRONTIERS · ONE SKILL TREE</p><h2 id="world-gallery-title">Your math changes what the crew can build.</h2></div>
          <p>Every world turns Grade 7–9 ideas into a mission with a reason to finish it.</p>
        </div>
        <div className="frontier-world-cards">
          {featuredFrontierWorlds.map((world) => (
            <article className={`frontier-world-card frontier-card-${world.id}`} key={world.id}>
              <div className="frontier-world-card-image">
                <Image src={world.image} alt={world.alt} fill sizes="(max-width: 760px) 92vw, 33vw" loading="lazy" />
                <span>{world.index} · {world.kicker}</span>
              </div>
              <div className="frontier-world-card-copy">
                <small>{world.worldName}</small>
                <h3>{world.title}</h3>
                <p>{world.story}</p>
                <ul aria-label={`${world.worldName} math skills`}>{world.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                <a href={world.href}>{world.cta} <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="frontier-mission-loop" aria-labelledby="mission-loop-title">
        <div className="frontier-section-heading frontier-heading-light">
          <span className="frontier-section-index">03 · MISSION LOOP</span>
          <div><p className="frontier-kicker">A FEW MINUTES · FOUR MOVES</p><h2 id="mission-loop-title">Somewhere along the way, the math clicks.</h2></div>
          <p>Example → practice → correction → boss. The rhythm stays simple so the challenge can get smarter.</p>
        </div>
        <div className="frontier-loop-grid">
          {missionSteps.map((step) => (
            <article className={`frontier-loop-card accent-${step.accent}`} key={step.number}>
              <header><span>{step.number}</span><TopicIcon visual={step.visual} accent={step.accent} size="md" label="" /></header>
              <small>{step.label}</small>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
        <div className="frontier-loop-footer">
          <span><b>6–8</b><small>minutes per mission</small></span>
          <i aria-hidden="true" />
          <p>No marathon session required. Finish one meaningful run, then come back when you want the next world.</p>
          <a href="/learn?grade=8&demo=1">Try the loop <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="frontier-field-test" aria-labelledby="field-test-title">
        <div className="frontier-field-visual">
          <Image src="/visuals/graphing-line-city-context.webp" alt="A line graph becoming a route through a future city" fill sizes="(max-width: 900px) 100vw, 52vw" loading="lazy" />
          <div className="frontier-coordinate-hud" aria-hidden="true"><span>(1, 2)</span><span>(2, 4)</span><span>(3, 6)</span><strong>y = 2x</strong></div>
        </div>
        <div className="frontier-field-copy">
          <span className="frontier-section-index">04 · INTERACTIVE FIELD TEST</span>
          <p className="frontier-kicker">POINTS BECOME A ROUTE</p>
          <h2 id="field-test-title">Plot it. Connect it. Read the line back.</h2>
          <p>Place several coordinates on the grid, connect them into a line, then identify exact points from the route you built. You can also type <b>y = 2x</b> and watch the graph respond.</p>
          <ol>
            <li><span>1</span><div><b>Plot the coordinates</b><small>Build the relationship point by point.</small></div></li>
            <li><span>2</span><div><b>Connect the route</b><small>See how repeated change creates a straight line.</small></div></li>
            <li><span>3</span><div><b>Read a point back</b><small>Turn the visual into an ordered pair.</small></div></li>
          </ol>
          <a className="frontier-dark-button" href="/labs/linear-graphs#point-mission">Open the live Graph Lab <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="frontier-recovery" aria-labelledby="recovery-title">
        <div className="frontier-recovery-copy">
          <span className="frontier-section-index">05 · RECOVERY SYSTEM</span>
          <p className="frontier-kicker">A MISS IS NEW INFORMATION</p>
          <h2 id="recovery-title">Wrong does not end the run.</h2>
          <p>A miss reveals a focused hint. Correct it, recover score, and keep moving. The same idea returns in a later mission until you can solve it without help.</p>
          <div className="frontier-recovery-tags"><span>Hint unlocked</span><span>Retry ready</span><span>Points recoverable</span></div>
        </div>
        <div className="frontier-recovery-board" aria-label="A sample mission recovery and boss route">
          <header><span>MARS SYSTEMS</span><strong>3 / 4 online</strong></header>
          <div className="frontier-system-track"><span className="done">✓</span><i /><span className="done">✓</span><i /><span className="repair">↻</span><i /><span>4</span><i /><b>★</b></div>
          <article><small>ROUTE CORRECTION</small><h3>Check the direction of your slope.</h3><p>You used the right change, but moved down instead of up. Try the point again.</p><footer><span>Correction earns the key</span><b>+30 XP</b></footer></article>
        </div>
      </section>

      <section className="frontier-curriculum" id="curriculum" aria-labelledby="curriculum-title">
        <div className="frontier-section-heading">
          <span className="frontier-section-index">06 · EXPEDITION MAP</span>
          <div><p className="frontier-kicker">GRADES 7–12</p><h2 id="curriculum-title">Choose the math you want to master next.</h2></div>
          <p>Start anywhere. Each path is built from short lessons, mixed checkpoints, and review that returns before an idea fades.</p>
        </div>
        <div className="frontier-grade-grid">
          {gradeCurricula.map((curriculum) => {
            const lessonCount = curriculum.regions.reduce((total, region) => total + region.lessons.length, 0);
            const gradeVisual = gradeVisuals[curriculum.grade];
            return (
              <a className={`frontier-grade-card accent-${gradeVisual.accent}`} href={`/learn?grade=${curriculum.grade}&demo=1`} key={curriculum.grade}>
                <header><TopicIcon visual={gradeVisual.visual} accent={gradeVisual.accent} size="md" label="" /><span>GRADE <b>{curriculum.grade}</b></span></header>
                <h3>{curriculum.subtitle}</h3>
                <p>{lessonCount} missions · {curriculum.regions.length} bosses</p>
                <strong>Open route <span aria-hidden="true">→</span></strong>
              </a>
            );
          })}
        </div>
        <div className="frontier-content-proof" aria-label="Course coverage">
          <span><b>{curriculumStats.grades}</b> grade paths</span>
          <span><b>{curriculumStats.lessons}</b> short missions</span>
          <span><b>{curriculumStats.questions}</b> practice checks</span>
          <span><b>{expandedSceneCount}</b> full visual scenes</span>
        </div>
      </section>

      <section className="frontier-privacy" aria-labelledby="privacy-title">
        <div className="frontier-privacy-signal" aria-hidden="true"><span>◆</span><i /><i /><i /><b>CODE NAME ONLY</b></div>
        <div>
          <span className="frontier-section-index">07 · PRIVATE BY DESIGN</span>
          <p className="frontier-kicker">YOUR PROGRESS IS YOURS</p>
          <h2 id="privacy-title">Explore without the spotlight.</h2>
          <p>Your math progress has a codename—not a public profile. Google helps you return, but Math does not save your Google name, email, photo, or original account ID.</p>
          <ul><li>No public real name</li><li>No searchable student profile</li><li>Leaderboard is opt-in and anonymous</li></ul>
          <a href="/privacy">Read the privacy details <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="frontier-launch" id="join">
        <div className="frontier-launch-copy">
          <span className="frontier-kicker">READY WHEN YOU ARE</span>
          <h2>The next frontier is six minutes away.</h2>
          <p>Choose a world, start one mission, and see how far a little math can take you.</p>
          <a href="/learn?grade=8&demo=1">Start without signing in <span aria-hidden="true">→</span></a>
        </div>
        <div className="frontier-launch-card">
          <small>SAVE YOUR EXPEDITION</small>
          <h3>Continue with Google</h3>
          <p>You receive a random codename and abstract avatar. Google profile details are not saved.</p>
          <GoogleSignIn clientId={clientId} />
          <span>For learners age 13 or older in this version.</span>
        </div>
      </section>
    </main>
  );
}
