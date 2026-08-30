import { PublicHeader } from "./Header";

export function FamilySafetyPage({ kind }: { kind: "league" }) {
  const league = kind === "league";
  return (
    <main className="site-shell legal-page family-safety-page">
      <PublicHeader />
      <article className="legal-wrap family-safety-wrap">
        <header>
          <span className="eyebrow">FAMILY LEARNING · PRIVATE BY DEFAULT</span>
          <h1>{league ? "Learning is no longer a public competition." : "Public posting is paused."}</h1>
          <p>{league ? "The weekly league has been retired as Math moves to private, parent-guided learning." : "The public feedback board has been retired so a child cannot accidentally publish personal information."}</p>
        </header>
        <section className="family-safety-explanation">
          <span aria-hidden="true">♡</span>
          <div>
            <h2>{league ? "What replaces it" : "Why this changed"}</h2>
            <p>{league ? "Families can keep their own progress, lesson history, and private keepsakes without being ranked against other learners." : "A future feedback channel will be designed for adults, kept separate from learning records, and reviewed before anything is shared."}</p>
          </div>
        </section>
        <footer>
          <a className="secondary-button" href="/privacy">Read the family privacy notice</a>
          <a className="primary-button" href="/">Return to family learning <span aria-hidden="true">→</span></a>
        </footer>
      </article>
    </main>
  );
}
