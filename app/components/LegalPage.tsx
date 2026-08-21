import { PublicHeader } from "./Header";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  return (
    <main className="site-shell legal-page">
      <PublicHeader />
      <article className="legal-wrap">
        <header><span className="eyebrow">PLAIN ENGLISH · VERSION 1.2</span><h1>{privacy ? "Privacy should be easy to understand." : "Simple rules for a calm learning space."}</h1><p>{privacy ? "Math is designed so even its maker cannot connect a real Google profile with learning progress." : "These terms explain the boundaries of the Grades 7–9 learning service."}</p></header>
        {privacy ? <PrivacyCopy /> : <TermsCopy />}
        <footer><p>Last updated: August 21, 2026</p><a className="primary-button" href="/">Return home <span>→</span></a></footer>
      </article>
    </main>
  );
}

function PrivacyCopy() {
  return <div className="legal-sections">
    <section><span>01</span><div><h2>What Google shares during sign-in</h2><p>Google sends a signed credential so Math can confirm that the same account has returned. That credential can contain profile information, but Math selects only Google’s stable account subject. It does not save your Google name, email address, or profile photo.</p></div></section>
    <section><span>02</span><div><h2>How the account stays anonymous</h2><p>The Google subject is immediately transformed with a private server HMAC key. The database keeps only that one-way key, a separate internal learner ID, and a random public nickname and abstract avatar.</p></div></section>
    <section><span>03</span><div><h2>What Math saves</h2><p>Math saves lesson progress, answer correctness, hint use, review timing, stars, XP, rewards, boss clears, streaks, privacy preferences, and secure session records. Raw written answers are not retained after checking. Feedback posts receive a new random name and are stored without a learner or account ID.</p></div></section>
    <section><span>04</span><div><h2>What becomes public</h2><p>Only learners who opt in appear in the weekly league. The public row contains a random nickname, abstract avatar, weekly XP, and rank. There are no public profiles, searches, grades, accuracy scores, lesson histories, or archived leagues.</p></div></section>
    <section><span>05</span><div><h2>Analytics and advertising</h2><p>Math displays Google AdSense below the page content. Math does not send Google names, email addresses, nicknames, scores, answers, lesson progress, or internal learner IDs for ad targeting. When an ad loads, Google may receive page and device data such as the page URL, IP address, and cookies for ad delivery, measurement, and abuse prevention. Ad requests are tagged for teen treatment. Google’s <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">partner-sites policy</a> and consent controls govern that processing. Math does not use session replay or sell learning data. Operational logs must exclude credentials, Google profile claims, raw account subjects, and answer text.</p></div></section>
    <section><span>06</span><div><h2>Your controls</h2><p>You may leave the public league at any time. Account deletion requires fresh Google verification and removes active learning records and sessions. Hosted backup retention may still follow the infrastructure provider’s documented security schedule.</p></div></section>
    <section><span>07</span><div><h2>Age boundary</h2><p>The current service is intended for learners age 13 or older. It does not collect birth dates. Advertising requests use Google’s teen-treatment setting. A future version for younger learners will require a separate parental-consent and child-privacy design.</p></div></section>
  </div>;
}

function TermsCopy() {
  return <div className="legal-sections">
    <section><span>01</span><div><h2>Who may use Math</h2><p>You must be at least 13 years old and able to use a Google account. Math is an independent learning aid, not a school grading or credential service.</p></div></section>
    <section><span>02</span><div><h2>Learning content</h2><p>The site covers Grades 7 and 8 standards plus a Grade 9 Algebra I path through short lessons, practice, review, and game-like challenges. Content is an independent learning aid and may not match every school’s local sequence.</p></div></section>
    <section><span>03</span><div><h2>Fair play</h2><p>Do not automate answers, interfere with the service, attempt to identify another learner, or manipulate XP and league results. Rewards have no cash value and cannot be sold or transferred.</p></div></section>
    <section><span>04</span><div><h2>Your account</h2><p>Your Google sign-in is used only to return you to the same anonymous trail. You are responsible for access to that Google account. Math cannot recover progress without it.</p></div></section>
    <section><span>05</span><div><h2>Availability and changes</h2><p>The service may change lessons, correct errors, reset weekly leagues, or temporarily pause features for safety and maintenance. Progress will be preserved where reasonably possible.</p></div></section>
    <section><span>06</span><div><h2>Ending use</h2><p>You may delete your account from Profile at any time. Access may be limited when these terms are abused or when necessary to protect learners and the service.</p></div></section>
    <section><span>07</span><div><h2>Advertising</h2><p>Third-party ads may appear below the learning content and are provided under Google’s policies. Do not automate or artificially interact with ads. Ad availability may vary by location, consent choice, device settings, ad blockers, and Google’s approval of the site.</p></div></section>
  </div>;
}
