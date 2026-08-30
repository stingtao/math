export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="brand"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></span>
        <p>Built by a parent, with AI and human review, for math time shared side by side.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/labs/linear-graphs">Graph Lab</a>
        <a href="/feedback">Feedback</a>
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
      <span>Grades 7–12 · parent-guided · no advertising</span>
    </footer>
  );
}
