import { PublicHeader } from "./Header";

export function AboutPage() {
  return (
    <main className="site-shell legal-page about-page">
      <PublicHeader />
      <article className="legal-wrap about-wrap">
        <header>
          <span className="eyebrow">WHY THIS SITE EXISTS</span>
          <h1>A dad built it for his daughter.</h1>
          <p>Sting’s daughter had math to review. He wanted practice to feel more like exploring a new world than reading another worksheet—so he built this site for her.</p>
        </header>

        <div className="about-principles" aria-label="How this project works">
          <section className="about-principle featured">
            <span aria-hidden="true">✦</span>
            <div><small>THE FIRST IDEA</small><h2>Math is fun when it does something.</h2><p>A ratio can ration water on Mars. A graph can guide a rover. A quadratic can shape a bridge. Every lesson starts with a reason to care, then gives you a short way to practice it.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">→</span>
            <div><small>THE LEARNING LOOP</small><h2>See it. Try it. Fix it. Get it.</h2><p>Lessons are short. A wrong answer opens a useful clue and another chance. The goal is not a perfect streak—it is leaving with an idea you can use again.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">◇</span>
            <div><small>HOW IT IS MADE</small><h2>Sting and AI build together.</h2><p>AI helps with code, questions, explanations, and art direction. Humans still need to check the math. If something looks wrong or unclear, please challenge it and send a correction.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">↗</span>
            <div><small>OPEN TO EVERYONE</small><h2>Use it. Remix it. Make it better.</h2><p>The original learning text and images are free to copy and adapt. Check the facts before reusing them, share improvements, and help the next learner go further.</p></div>
          </section>
        </div>

        <aside className="about-humanity-note">
          <span aria-hidden="true">♡</span>
          <div><small>FROM ONE FAMILY TO MANY</small><h2>It started with one daughter’s review.</h2><p>Now anyone can use it. If it helps one more student enjoy math—or makes one hard idea finally click—then building it was worth it.</p></div>
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
