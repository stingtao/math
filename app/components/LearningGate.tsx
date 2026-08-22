type LearningGateTone = "blue" | "teal" | "violet" | "gold";

type LearningLoadingProps = {
  glyph: string;
  kicker: string;
  title: string;
  detail: string;
  tone?: LearningGateTone;
};

export function LearningLoading({ glyph, kicker, title, detail, tone = "blue" }: LearningLoadingProps) {
  return (
    <main className={`loading-page learning-loading accent-${tone}`} role="status" aria-live="polite">
      <section className="learning-loading-card">
        <div className="learning-loading-orbit" aria-hidden="true"><span>{glyph}</span><i /><i /><i /></div>
        <span className="section-kicker">{kicker}</span>
        <strong>{title}</strong>
        <p>{detail}</p>
        <div className="learning-loading-route" aria-hidden="true"><i /><i /><i /><i /></div>
      </section>
    </main>
  );
}

type LearningSignInGateProps = {
  glyph: string;
  kicker: string;
  title: string;
  detail: string;
};

export function LearningSignInGate({ glyph, kicker, title, detail }: LearningSignInGateProps) {
  return (
    <main className="auth-gate learning-sign-in-gate">
      <a className="brand" href="/"><span className="brand-mark">M</span><span>Math</span></a>
      <div className="auth-card">
        <span className="auth-orbit" aria-hidden="true">{glyph}</span>
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
        <a className="primary-button" href="/#join">Continue with Google <span aria-hidden="true">→</span></a>
        <small>Your Google name, email, and photo never appear on your learning trail.</small>
      </div>
    </main>
  );
}
