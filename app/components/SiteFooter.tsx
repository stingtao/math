export function SiteFooter() {
  return (
    <footer className="site-footer google-anno-skip">
      <div>
        <span className="brand"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></span>
        <p>Built with AI and human review. Take what helps; check what matters.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/labs/linear-graphs">Graph Lab</a>
        <a href="/about">About</a>
        <a href="/feedback">Feedback</a>
        <a href="/leaderboard">Weekly league</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
      <span>Grades 7–12 · private by design</span>
    </footer>
  );
}
