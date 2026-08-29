export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="brand"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></span>
        <p>Made by Sting, a parent who likes math.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/labs/linear-graphs">Graph Lab</a>
        <a href="/feedback">Feedback</a>
        <a href="/leaderboard">Leaderboard</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
      <span>Grades 7–12 · English</span>
    </footer>
  );
}
