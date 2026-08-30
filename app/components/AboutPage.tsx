import { PublicHeader } from "./Header";

export function AboutPage() {
  return (
    <main className="site-shell legal-page about-page">
      <PublicHeader />
      <article className="legal-wrap about-wrap">
        <header>
          <span className="eyebrow">WHY THIS SITE EXISTS</span>
          <h1>A dad built it to sit beside his daughter.</h1>
          <p>Sting’s daughter had math to review. He did not want to hand her another app and walk away. He wanted something they could open together—so the screen could organize the practice while he listened, asked questions, and helped.</p>
        </header>

        <div className="about-principles" aria-label="How this project works">
          <section className="about-principle featured">
            <span aria-hidden="true">✦</span>
            <div><small>THE FIRST IDEA</small><h2>Math is easier to face with someone beside you.</h2><p>A ratio can ration water on Mars. A graph can guide a rover. A quadratic can shape a bridge. Every lesson gives the child something meaningful to try and the grown-up one useful question to ask.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">→</span>
            <div><small>THE FAMILY LOOP</small><h2>Ask. Try. Listen. Talk it through.</h2><p>Lessons are short. The child makes the first move. A parent prompt helps the grown-up listen before explaining. A wrong answer becomes something the family can investigate together.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">◇</span>
            <div><small>HOW IT IS MADE</small><h2>Sting and AI build together.</h2><p>AI helps with code, questions, explanations, and art direction. Humans still need to check the math. Signed-in parents can send corrections through a reviewed adult feedback channel.</p></div>
          </section>
          <section className="about-principle">
            <span aria-hidden="true">↗</span>
            <div><small>OPEN TO FAMILIES</small><h2>Use it. Remix it. Learn together.</h2><p>The original learning text and images are free to copy and adapt. Check the facts before reusing them, and shape the activity around the conversation your child needs.</p></div>
          </section>
        </div>

        <aside className="about-humanity-note">
          <span aria-hidden="true">♡</span>
          <div><small>FROM ONE FAMILY TO MANY</small><h2>It started with time together.</h2><p>If one more parent feels able to sit down, ask a good question, and share the moment when a hard idea clicks, then building it was worth it.</p></div>
        </aside>

        <p className="about-scope-note">This reuse invitation covers original learning text and original image assets published by Math. Trademarks, linked services, fonts, software, and other externally licensed material remain under their own terms.</p>

        <footer>
          <a className="secondary-button" href="/">Return home</a>
          <a className="primary-button" href="/#join">Open a parent account <span>→</span></a>
        </footer>
      </article>
    </main>
  );
}
