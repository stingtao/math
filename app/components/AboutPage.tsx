import { PublicHeader } from "./Header";

export function AboutPage() {
  return (
    <main className="site-shell legal-page about-page">
      <PublicHeader />
      <article className="legal-wrap about-wrap">
        <header>
          <span className="eyebrow">ABOUT MATH · AN OPEN LEARNING PROJECT</span>
          <h1>Built with AI. Improved by people.</h1>
          <p>Math is an independent learning project made through ongoing collaboration between a human creator and AI tools. The goal is simple: help more people understand math, question ideas, and move humanity forward together.</p>
        </header>

        <div className="about-principles" aria-label="How this project works">
          <section className="about-principle featured">
            <span aria-hidden="true">◇</span>
            <div><small>THE WORKING METHOD</small><h2>AI helps create. Humans keep checking.</h2><p>AI has helped draft code, explanations, questions, stories, and visual directions. Every part can still contain a mistake. AI can sound certain while being wrong, so curiosity and verification are part of the learning experience.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">↗</span>
            <div><small>TAKE WHAT HELPS</small><h2>Copy it. Share it. Remix it.</h2><p>You may freely copy, share, and adapt the original learning text and image assets from this site for learning, teaching, or a new creative project. You do not need to ask first. A link back is appreciated, but not required.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">✓</span>
            <div><small>CHECK BEFORE YOU TRUST</small><h2>Use the idea—not blind confidence.</h2><p>Check equations, examples, answer keys, images, and claims against a trusted teacher, textbook, or another reliable source. Anyone reusing the material should make the same accuracy check.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">＋</span>
            <div><small>HELP IT GET BETTER</small><h2>A correction is a contribution.</h2><p>If something is confusing, inaccurate, or missing, tell us. Useful feedback makes the next learner’s path clearer. Please keep feedback anonymous and leave out names, email addresses, or other contact details.</p></div>
          </section>
        </div>

        <aside className="about-humanity-note">
          <span aria-hidden="true">✦</span>
          <div><small>THE BIGGER MISSION</small><h2>Knowledge grows when we pass it on.</h2><p>No person or machine gets everything right alone. We progress by exploring, testing, correcting, and sharing what we learn. This project hopes to be one small part of humanity learning together.</p></div>
        </aside>

        <p className="about-scope-note">This reuse invitation covers original learning text and original image assets published by Math. Third-party advertisements, trademarks, linked services, fonts, software, and other externally licensed material remain under their own terms.</p>

        <footer>
          <a className="secondary-button" href="/">Return home</a>
          <a className="primary-button" href="/feedback">Share a correction <span>→</span></a>
        </footer>
      </article>
    </main>
  );
}
