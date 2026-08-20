import { GoogleSignIn } from "./components/GoogleSignIn";
import { PublicHeader } from "./components/Header";
import { curriculumStats, gradeCurricula } from "@/lib/curriculum";

const trailStops = [
  { number: "01", label: "Read one short explanation", tone: "blue", state: "complete" },
  { number: "02", label: "Work through one example", tone: "teal", state: "current" },
  { number: "03", label: "Correct five practice questions", tone: "violet", state: "locked" },
  { number: "04", label: "Return later for review", tone: "gold", state: "locked" },
];

export default function Home() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  return <main className="site-shell">
    <PublicHeader />

    <section className="hero" id="top">
      <div className="hero-copy">
        <span className="eyebrow">MATH · GRADES 7–9</span>
        <h1>A simple place<br />to learn math.</h1>
        <p>Short English lessons, worked examples, practice, and review. Start with the grade that matches what you are learning now.</p>
        <div className="hero-actions"><a className="primary-button" href="/learn?grade=8&demo=1">Try a lesson <span aria-hidden="true">→</span></a><a className="text-link" href="#story">Why I made this</a></div>
        <div className="hero-proof" aria-label="Course contents"><div><strong>{curriculumStats.grades}</strong><span>grade paths</span></div><div><strong>{curriculumStats.lessons}</strong><span>short lessons</span></div><div><strong>{curriculumStats.questions}</strong><span>practice checks</span></div></div>
      </div>
      <div className="trail-card" aria-label="How a lesson works">
        <div className="trail-card-header"><div><span className="mini-label">A USUAL STUDY SESSION</span><h2>One idea at a time</h2></div><span className="progress-pill">6–8 min</span></div>
        <ol className="trail-list">{trailStops.map((stop, index) => <li className={`trail-stop ${stop.state}`} key={stop.number}><span className={`trail-node ${stop.tone}`} aria-hidden="true">{stop.state === "complete" ? "✓" : stop.number}</span>{index < trailStops.length - 1 && <span className="trail-line" aria-hidden="true" />}<div><span className="stop-kicker">STEP {stop.number}</span><strong>{stop.label}</strong></div>{stop.state === "current" && <span className="continue-chip">Next</span>}</li>)}</ol>
        <div className="boss-preview"><span className="boss-icon" aria-hidden="true">★</span><div><span>AFTER FOUR LESSONS</span><strong>Try five mixed questions</strong></div></div>
      </div>
    </section>

    <section className="founder-section" id="story">
      <div className="founder-mark" aria-hidden="true">S</div>
      <div><span className="section-kicker">WHY THIS EXISTS</span><h2>Hi, I’m Sting. I’m a parent, and I like math.</h2><p>I made this because my child needs to learn math. I wanted a site that is quiet, clear, and easy to continue the next day. I’m trying explanations, practice, review, and a few game elements to see what actually helps.</p><p>You are welcome to use it. If something is confusing or missing, leave an anonymous note on the <a href="/feedback">feedback board</a>. I’ll read it and see what I can improve.</p></div>
    </section>

    <section className="curriculum-section" id="curriculum">
      <div className="section-heading split-heading"><div><span className="section-kicker">CHOOSE A GRADE</span><h2>Grades 7, 8, and 9</h2></div><p>Every path is divided into four-lesson regions. You can try the site without an account; Google sign-in is only for saving progress across visits and devices.</p></div>
      <div className="grade-cards">{gradeCurricula.map((curriculum) => {
        const lessonCount = curriculum.regions.reduce((total, region) => total + region.lessons.length, 0);
        return <article className={`grade-card grade-${curriculum.grade}`} key={curriculum.grade}><span>GRADE</span><strong>{curriculum.grade}</strong><h3>{curriculum.subtitle}</h3><p>{lessonCount} lessons · {curriculum.regions.length} mixed checks</p><a href={`/learn?grade=${curriculum.grade}&demo=1`}>Open Grade {curriculum.grade} <span>→</span></a></article>;
      })}</div>
      <div className="region-grid compact-region-grid">{gradeCurricula.flatMap((curriculum) => curriculum.regions.slice(0, 2).map((region) => <article className={`region-card accent-${region.accent}`} key={region.id}><span className="region-index">G{curriculum.grade} · {String(region.order).padStart(2, "0")}</span><div className="region-symbol" aria-hidden="true">{region.order % 2 ? "◒" : "◆"}</div><h3>{region.title}</h3><p>{region.subtitle}</p><span className="region-meta">4 lessons · 1 mixed check</span></article>))}</div>
    </section>

    <section className="privacy-section">
      <div className="privacy-visual" aria-hidden="true"><span className="privacy-orbit">✦</span><div><i /><i /><i /></div></div>
      <div className="privacy-copy"><span className="section-kicker">SIMPLE AND ANONYMOUS</span><h2>I don’t want to know who is getting which score.</h2><p>Google sign-in is there so the same learner can return to saved progress. The site does not store the Google name, email address, profile photo, or original account identifier. The saved key is one-way transformed on the server.</p><p>Public leaderboards use a random nickname and abstract avatar. They never show grade, accuracy, lesson history, or a profile link.</p><ul><li>No ads or behavior tracking</li><li>No searchable learner profiles</li><li>Leaderboard is opt-in</li><li>Feedback posts are not connected to progress</li></ul><a className="text-link" href="/privacy">Read the plain-English privacy page</a></div>
    </section>

    <section className="join-section" id="join">
      <div className="join-copy"><span className="section-kicker">SAVE FOR NEXT TIME</span><h2>Use Google only if you want to keep progress.</h2><p>After sign-in, the site makes a random nickname and abstract avatar. It does not keep the Google profile information.</p><p>You can also <a href="/learn?grade=8&demo=1">try the demo first</a>.</p></div>
      <div className="join-card"><span className="join-star" aria-hidden="true">✦</span><h3>Continue with Google</h3><p>For learners age 13 or older in this first version.</p><GoogleSignIn clientId={clientId} /></div>
    </section>

    <footer className="site-footer"><div><span className="brand"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></span><p>Made by Sting, a parent who likes math.</p></div><nav aria-label="Footer navigation"><a href="/feedback">Feedback</a><a href="/leaderboard">Leaderboard</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><span>Grades 7–9 · English</span></footer>
  </main>;
}
