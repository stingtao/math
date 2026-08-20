import { GoogleSignIn } from "./components/GoogleSignIn";
import { PublicHeader } from "./components/Header";
import { curriculumStats, regions } from "@/lib/curriculum";

const trailStops = [
  { number: "01", label: "Math symbols", tone: "blue", state: "complete" },
  { number: "02", label: "Signed numbers", tone: "coral", state: "current" },
  { number: "03", label: "Sign rules", tone: "violet", state: "locked" },
  { number: "04", label: "Order of operations", tone: "gold", state: "locked" },
];

const features = [
  { number: "01", title: "See the idea", copy: "Visual explanations turn abstract rules into something you can picture.", tone: "blue" },
  { number: "02", title: "Try a small step", copy: "Five focused questions, immediate feedback, and hints that never shame you.", tone: "teal" },
  { number: "03", title: "Feel your progress", copy: "Earn stars, clear boss quests, and join a private-by-design weekly league.", tone: "gold" },
];

export default function Home() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  return (
    <main className="site-shell">
      <PublicHeader />

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">Grade 8 · Complete Common Core journey</span>
          <h1>Math feels lighter<br />one step at a time.</h1>
          <p>Clear visual lessons, kind feedback, and short challenges help you build real momentum—without the pressure.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#join">Start your trail <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#how">See how it works</a>
          </div>
          <div className="hero-proof" aria-label="Course highlights">
            <div><strong>{curriculumStats.lessons}</strong><span>short lessons</span></div>
            <div><strong>{curriculumStats.bosses}</strong><span>boss quests</span></div>
            <div><strong>5–8</strong><span>minutes each</span></div>
          </div>
        </div>

        <div className="trail-card" aria-label="Example learning trail">
          <div className="trail-card-header">
            <div><span className="mini-label">YOUR NEXT REGION</span><h2>Number Foundations</h2></div>
            <span className="progress-pill">1 of 4</span>
          </div>
          <div className="trail-progress" aria-label="25% region progress"><span /></div>
          <ol className="trail-list">
            {trailStops.map((stop, index) => (
              <li className={`trail-stop ${stop.state}`} key={stop.number}>
                <span className={`trail-node ${stop.tone}`} aria-hidden="true">{stop.state === "complete" ? "✓" : stop.number}</span>
                {index < trailStops.length - 1 && <span className="trail-line" aria-hidden="true" />}
                <div><span className="stop-kicker">LESSON {stop.number}</span><strong>{stop.label}</strong></div>
                {stop.state === "current" && <span className="continue-chip">Continue</span>}
                {stop.state === "locked" && <span className="lock" aria-label="Locked">·</span>}
              </li>
            ))}
          </ol>
          <div className="boss-preview"><span className="boss-icon" aria-hidden="true">★</span><div><span>REGION BOSS</span><strong>Unlock after lesson 04</strong></div></div>
        </div>
      </section>

      <section className="promise-section" id="how">
        <div className="section-heading narrow-heading">
          <span className="section-kicker">A BETTER LEARNING RHYTHM</span>
          <h2>Clarity first. Confidence follows.</h2>
          <p>Every lesson uses the same calm rhythm, so your attention stays on the math—not on figuring out what to do next.</p>
        </div>
        <div className="promise-row">
          {features.map((feature) => <article key={feature.number}><span className={`promise-number text-${feature.tone}`}>{feature.number}</span><h3>{feature.title}</h3><p>{feature.copy}</p></article>)}
        </div>
      </section>

      <section className="curriculum-section" id="curriculum">
        <div className="section-heading split-heading">
          <div><span className="section-kicker">THE COMPLETE GRADE 8 TRAIL</span><h2>Thirteen regions.<br />One connected journey.</h2></div>
          <p>Start with number foundations, climb through algebra and functions, then finish with geometry and data. Each region ends with a short mixed boss quest.</p>
        </div>
        <div className="region-grid">
          {regions.map((region) => (
            <article className={`region-card accent-${region.accent}`} key={region.id}>
              <span className="region-index">{String(region.id).padStart(2, "0")}</span>
              <div className="region-symbol" aria-hidden="true">{region.id % 3 === 0 ? "◆" : region.id % 3 === 1 ? "◒" : "✦"}</div>
              <h3>{region.title}</h3>
              <p>{region.subtitle}</p>
              <span className="region-meta">4 lessons · 1 boss</span>
            </article>
          ))}
        </div>
        <div className="future-grades" aria-label="Future grade roadmap">
          <span>Grade 7 <em>Coming soon</em></span><strong>Grade 8 <em>Open now</em></strong><span>Grade 9 <em>Coming soon</em></span><span>Grades 10–12 <em>Coming soon</em></span>
        </div>
      </section>

      <section className="privacy-section">
        <div className="privacy-visual" aria-hidden="true"><span className="privacy-orbit">✦</span><div><i /><i /><i /></div></div>
        <div className="privacy-copy">
          <span className="section-kicker">PRIVATE BY DESIGN</span>
          <h2>Your progress belongs to you.</h2>
          <p>Google gets you back to your trail. Math stores a one-way anonymous key—not your name, email, or photo. Your public league identity is a random nickname and abstract avatar.</p>
          <ul><li>No public profiles or search</li><li>No ads or session replay</li><li>Leave the league or delete your account anytime</li></ul>
          <a className="text-link" href="/privacy">Read our plain-English privacy promise</a>
        </div>
      </section>

      <section className="join-section" id="join">
        <div className="join-copy"><span className="section-kicker">YOUR FIRST SMALL WIN IS READY</span><h2>Start where you are.</h2><p>One account. An anonymous identity. A complete Grade 8 trail that always remembers your next best step.</p></div>
        <div className="join-card"><span className="join-star" aria-hidden="true">✦</span><h3>Begin your trail</h3><p>Your random nickname and avatar are created after sign-in.</p><GoogleSignIn clientId={clientId} /></div>
      </section>

      <footer className="site-footer">
        <div><span className="brand"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></span><p>Small steps. Real progress.</p></div>
        <nav aria-label="Footer navigation"><a href="/leaderboard">Leaderboard</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
        <span>Grade 8 · Common Core aligned</span>
      </footer>
    </main>
  );
}
