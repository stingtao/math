"use client";

import { useMemo, useState } from "react";
import { getGradeCurriculum, getGradeLessons } from "@/lib/curriculum";
import { saveDemoState } from "@/lib/learner-state";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";

export function LearningDashboard({ demo, grade }: { demo: boolean; grade: number }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [rewardMessage, setRewardMessage] = useState("");

  const completed = useMemo(() => new Map(state?.completedLessons.map((item) => [item.id, item.stars]) ?? []), [state]);
  const cleared = useMemo(() => new Set(state?.clearedBosses.map((item) => item.regionId) ?? []), [state]);
  const curriculum = getGradeCurriculum(grade);
  const gradeLessons = getGradeLessons(grade);
  const nextLesson = gradeLessons.find((item) => !completed.has(item.id)) ?? gradeLessons[gradeLessons.length - 1];
  const gradeCompleted = gradeLessons.filter((item) => completed.has(item.id)).length;
  const gradeBosses = curriculum.regions.filter((item) => cleared.has(item.id)).length;

  if (loading) return <LoadingTrail />;
  if (!state || error) return <SignInGate />;

  async function claimReward() {
    if (state!.dailyRewardClaimed) return;
    if (demo) {
      const step = (state!.profile.rewardStep % 7) + 1;
      const tokens = [10, 12, 14, 16, 18, 20, 30][step - 1];
      const next = {
        ...state!,
        dailyRewardClaimed: true,
        profile: {
          ...state!.profile,
          rewardStep: step,
          trailTokens: state!.profile.trailTokens + tokens,
          currentStreak: state!.profile.currentStreak + 1,
          longestStreak: Math.max(state!.profile.longestStreak, state!.profile.currentStreak + 1),
          streakShields: state!.profile.streakShields + (step === 7 ? 1 : 0),
        },
      };
      saveDemoState(next);
      setState(next);
      setRewardMessage(`+${tokens} Trail Tokens${step === 7 ? " and a Streak Shield" : ""}`);
      return;
    }
    const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "claimDaily", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
    const body = await response.json() as { state?: typeof state; reward?: { tokens: number; shield?: boolean }; error?: string };
    if (response.ok && body.state) {
      setState(body.state);
      setRewardMessage(`+${body.reward?.tokens ?? 0} Trail Tokens${body.reward?.shield ? " and a Streak Shield" : ""}`);
    } else setRewardMessage(body.error ?? "Your reward could not be claimed.");
  }

  return (
    <main className="learner-shell">
      <LearnerHeader state={state} demo={demo} />
      {demo && <div className="demo-banner"><span>Preview mode</span><p>Your progress stays in this browser session.</p><a href="/#join">Use Google to keep it for next time</a></div>}
      <section className="dashboard-wrap">
        <nav className="grade-switcher" aria-label="Choose a grade">
          {[7, 8, 9].map((item) => <a className={item === grade ? "active" : ""} href={`/learn?grade=${item}${demo ? "&demo=1" : ""}`} key={item}>Grade {item}</a>)}
        </nav>
        <div className="dashboard-heading">
          <div><span className="section-kicker">WELCOME BACK, {state.profile.nickname.toUpperCase()}</span><h1>Ready for one small win?</h1><p>Your trail is waiting exactly where you left it.</p></div>
          <div className="dashboard-summary">
            <div><strong>{state.totalXp}</strong><span>Total XP</span></div>
            <div><strong>{gradeCompleted}<small>/{gradeLessons.length}</small></strong><span>Grade {grade} lessons</span></div>
            <div><strong>{gradeBosses}<small>/{curriculum.regions.length}</small></strong><span>Bosses</span></div>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="next-card">
            <div className={`next-visual accent-${nextLesson.accent}`} aria-hidden="true"><span>{String(curriculum.regions.find((item) => item.id === nextLesson.regionId)?.order ?? 1).padStart(2, "0")}</span><div className={`concept-mini concept-${nextLesson.visual}`}><i /><i /><i /></div></div>
            <div className="next-copy"><span className="section-kicker">GRADE {grade} · UP NEXT</span><h2>{nextLesson.title}</h2><p>{nextLesson.goal}</p><div className="next-meta"><span>◷ 6–8 min</span><span>◆ 40 XP</span><span>☆ 3 stars</span></div><a className="primary-button" href={`/learn/${nextLesson.slug}?grade=${grade}${demo ? "&demo=1" : ""}`}>Continue lesson <span aria-hidden="true">→</span></a></div>
          </section>

          <aside className={`daily-card ${state.dailyRewardClaimed ? "claimed" : ""}`}>
            <div className="daily-card-top"><span className="daily-icon" aria-hidden="true">◆</span><span className="section-kicker">DAILY TRAIL REWARD</span></div>
            <h2>{state.dailyRewardClaimed ? "Reward collected" : "A little boost for showing up."}</h2>
            <div className="reward-calendar" aria-label="Seven-claim reward cycle">
              {[10, 12, 14, 16, 18, 20, 30].map((amount, index) => <span className={index + 1 < state.profile.rewardStep || state.dailyRewardClaimed && index + 1 === state.profile.rewardStep ? "done" : index + 1 === (state.profile.rewardStep % 7) + 1 ? "today" : ""} key={amount}>{index === 6 ? "◇" : amount}</span>)}
            </div>
            <button className="secondary-button full-button" type="button" disabled={state.dailyRewardClaimed} onClick={claimReward}>{state.dailyRewardClaimed ? "Come back tomorrow" : "Claim today’s reward"}</button>
            <p className="reward-note" aria-live="polite">{rewardMessage || `Miss a day? Your ${state.profile.rewardStep || 1}-step reward path will wait.`}</p>
          </aside>
        </div>

        <section className="trail-overview">
          <div className="section-heading split-heading compact-heading"><div><span className="section-kicker">GRADE {grade}</span><h2>The full learning trail</h2></div><p>{curriculum.subtitle}. Finish every correction to move forward; stars do not block progress.</p></div>
          <div className="world-list">
            {curriculum.regions.map((region, regionIndex) => {
              const regionComplete = region.lessons.every((item) => completed.has(item.id));
              const previousCleared = regionIndex === 0 || cleared.has(curriculum.regions[regionIndex - 1].id);
              const bossCleared = cleared.has(region.id);
              return (
                <article className={`world-card accent-${region.accent} ${previousCleared ? "unlocked" : "world-locked"}`} key={region.id}>
                  <header className="world-header"><span className="world-number">{String(region.order).padStart(2, "0")}</span><div><span>{region.standard}</span><h3>{region.title}</h3><p>{region.subtitle}</p></div><span className="world-status">{bossCleared ? "Cleared" : previousCleared ? `${region.lessons.filter((item) => completed.has(item.id)).length}/4` : "Locked"}</span></header>
                  <div className="world-path">
                    {region.lessons.map((item, index) => {
                      const stars = completed.get(item.id);
                      const priorLessonComplete = index === 0 || completed.has(region.lessons[index - 1].id);
                      const available = previousCleared && (Boolean(stars) || priorLessonComplete);
                      const content = <><span className="path-dot">{stars ? "✓" : String(index + 1).padStart(2, "0")}</span><span className="path-title">{item.title}</span><span className="path-stars" aria-label={stars ? `${stars} stars` : available ? "Ready" : "Locked"}>{stars ? `${"★".repeat(stars)}${"☆".repeat(3 - stars)}` : available ? "Ready →" : "·"}</span></>;
                      return available ? <a className={`path-lesson ${stars ? "complete" : "current"}`} href={`/learn/${item.slug}?grade=${grade}${demo ? "&demo=1" : ""}`} key={item.id}>{content}</a> : <div className="path-lesson locked" key={item.id}>{content}</div>;
                    })}
                    {regionComplete ? <a className={`boss-node ${bossCleared ? "complete" : "ready"}`} href={`/boss/${region.id}?grade=${grade}${demo ? "&demo=1" : ""}`}><span>★</span><strong>{bossCleared ? "Boss cleared" : "Boss ready"}</strong><small>{bossCleared ? "+100 XP earned" : "5 mixed questions"}</small></a> : <div className="boss-node locked"><span>☆</span><strong>Region boss</strong><small>Complete all 4 lessons</small></div>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

function LoadingTrail() {
  return <main className="loading-page" role="status"><div className="loading-mark">M</div><p>Finding your next small step…</p></main>;
}

function SignInGate() {
  return <main className="auth-gate"><a className="brand" href="/"><span className="brand-mark">M</span><span>Math</span></a><div className="auth-card"><span className="auth-orbit">✦</span><span className="section-kicker">YOUR TRAIL IS PRIVATE</span><h1>Sign in to keep learning.</h1><p>Your lessons and progress stay behind your anonymous profile.</p><a className="primary-button" href="/#join">Continue with Google <span>→</span></a><small>Math never stores your Google name, email, or photo.</small></div></main>;
}
