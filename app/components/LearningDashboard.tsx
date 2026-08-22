"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getGradeCurriculum, getGradeLessons } from "@/lib/curriculum";
import { getRegionLandmark } from "@/lib/visual-landmarks";
import { saveDemoState } from "@/lib/learner-state";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { Avatar } from "./Avatar";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";

const dailyRewardAmounts = [10, 12, 14, 16, 18, 20, 30];

export function LearningDashboard({ demo, grade }: { demo: boolean; grade: number }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [rewardMessage, setRewardMessage] = useState("");
  const [showFullMap, setShowFullMap] = useState(false);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    try { setWelcomeDismissed(window.sessionStorage.getItem("math-welcome-guide") === "dismissed"); }
    catch { setWelcomeDismissed(false); }
    setWelcomeReady(true);
  }, []);

  const completed = useMemo(() => new Map(state?.completedLessons.map((item) => [item.id, item.stars]) ?? []), [state]);
  const cleared = useMemo(() => new Set(state?.clearedBosses.map((item) => item.regionId) ?? []), [state]);
  const curriculum = getGradeCurriculum(grade);
  const gradeLessons = getGradeLessons(grade);
  const nextLesson = gradeLessons.find((item) => !completed.has(item.id)) ?? gradeLessons[gradeLessons.length - 1];
  const gradeCompleted = gradeLessons.filter((item) => completed.has(item.id)).length;
  const gradeBosses = curriculum.regions.filter((item) => cleared.has(item.id)).length;
  const activeRegionIndexRaw = curriculum.regions.findIndex((item) => !cleared.has(item.id));
  const gradeComplete = activeRegionIndexRaw === -1;
  const activeRegionIndex = activeRegionIndexRaw === -1 ? Math.max(0, curriculum.regions.length - 1) : activeRegionIndexRaw;
  const activeRegion = curriculum.regions[activeRegionIndex];
  const activeDone = activeRegion.lessons.filter((item) => completed.has(item.id)).length;
  const activeNextLesson = activeRegion.lessons.find((item) => !completed.has(item.id));
  const activeBossReady = activeDone === activeRegion.lessons.length;
  const reviewBatchSize = Math.min(state?.dueReview ?? 0, 5);
  const focusedStart = Math.max(0, activeRegionIndex - 1);
  const focusedEnd = Math.min(curriculum.regions.length, activeRegionIndex + 2);
  const visibleRegions = showFullMap ? curriculum.regions : curriculum.regions.slice(focusedStart, focusedEnd);
  const questHref = gradeComplete
    ? `/review?grade=${grade}${demo ? "&demo=1" : ""}`
    : activeBossReady
    ? `/boss/${activeRegion.id}?grade=${grade}${demo ? "&demo=1" : ""}`
    : `/learn/${activeNextLesson?.slug ?? activeRegion.lessons[0].slug}?grade=${grade}${demo ? "&demo=1" : ""}`;

  if (loading) return <LoadingTrail />;
  if (!state || error) return <SignInGate />;

  async function claimReward() {
    if (state!.dailyRewardClaimed) return;
    if (demo) {
      const step = (state!.profile.rewardStep % 7) + 1;
      const tokens = dailyRewardAmounts[step - 1];
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

  const nextRewardStep = (state.profile.rewardStep % 7) + 1;
  const visibleRewardStep = state.dailyRewardClaimed ? state.profile.rewardStep : nextRewardStep;
  const visibleRewardAmount = dailyRewardAmounts[visibleRewardStep - 1];
  const showWelcomeGuide = welcomeReady && state.completedLessons.length === 0 && !welcomeDismissed;

  function dismissWelcomeGuide() {
    try { window.sessionStorage.setItem("math-welcome-guide", "dismissed"); } catch { /* Device storage is optional. */ }
    setWelcomeDismissed(true);
  }

  function rewardCellClass(claimNumber: number) {
    if (state.dailyRewardClaimed) return claimNumber <= visibleRewardStep ? "done" : "";
    if (state.profile.rewardStep < 7 && claimNumber <= state.profile.rewardStep) return "done";
    return claimNumber === nextRewardStep ? "today" : "";
  }

  return (
    <main className="learner-shell">
      <LearnerHeader state={state} demo={demo} />
      {rewardMessage.startsWith("+") && <SuccessBurst eventKey={`daily-${state.profile.rewardStep}`} />}
      {demo && <div className="demo-banner"><span>Preview mode</span><p>Your progress stays in this browser session.</p><a href="/#join">Use Google to keep it for next time</a></div>}
      <section className="dashboard-wrap">
        <nav className="grade-switcher" aria-label="Choose a grade">
          {[7, 8, 9].map((item) => <a className={item === grade ? "active" : ""} href={`/learn?grade=${item}${demo ? "&demo=1" : ""}`} key={item}>Grade {item}</a>)}
        </nav>
        <div className="dashboard-heading">
          <div><span className="section-kicker">{state.profile.nickname.toUpperCase()}</span><h1>Choose one next step.</h1><p>Your progress is saved here.</p></div>
          <div className="dashboard-summary">
            <div><strong>{state.totalXp}</strong><span>Total XP</span></div>
            <div><strong>{gradeCompleted}<small>/{gradeLessons.length}</small></strong><span>Grade {grade} lessons</span></div>
            <div><strong>{gradeBosses}<small>/{curriculum.regions.length}</small></strong><span>Bosses</span></div>
          </div>
        </div>

        {showWelcomeGuide && <section className={`welcome-trail-guide accent-${nextLesson.accent}`} aria-labelledby="welcome-trail-heading">
          <button className="welcome-guide-close" type="button" onClick={dismissWelcomeGuide} aria-label="Dismiss welcome guide">×</button>
          <header className="welcome-guide-heading">
            <Avatar avatar={state.profile.avatar} size="lg" label="Your random abstract avatar" />
            <div><span className="section-kicker">WELCOME, {state.profile.nickname.toUpperCase()}</span><h2 id="welcome-trail-heading">Your private trail starts with one small step.</h2><p>Math created a random nickname and abstract avatar for you. Your Google name, email, and photo are not saved.</p></div>
          </header>
          <div className="welcome-route" aria-label="Complete short lessons, collect four region keys, then unlock the boss">
            <div className="welcome-route-step"><TopicIcon visual={nextLesson.visual} accent={nextLesson.accent} size="md" label="First short lesson" /><div><small>STEP 1</small><strong>Short lesson</strong><span>6–8 minutes</span></div></div>
            <i className="welcome-route-connector" aria-hidden="true" />
            <div className="welcome-route-step welcome-key-step"><span className="welcome-mini-keys" aria-hidden="true"><b>1</b><b>2</b><b>3</b><b>4</b></span><div><small>REGION</small><strong>Collect 4 keys</strong><span>One key per lesson</span></div></div>
            <i className="welcome-route-connector" aria-hidden="true" />
            <div className="welcome-route-step welcome-boss-step"><span aria-hidden="true">★</span><div><small>UNLOCK</small><strong>Boss quest</strong><span>5 mixed questions</span></div></div>
          </div>
          <footer className="welcome-guide-footer">
            <div className="welcome-guide-promises"><p><span aria-hidden="true">✓</span><strong>Corrections count.</strong> Fix every answer and the lesson completes.</p><p><span aria-hidden="true">☆</span><strong>Stars are feedback.</strong> They celebrate this run and never lock progress.</p></div>
            <div className="welcome-guide-action"><small>YOUR FIRST QUEST</small><strong>{nextLesson.title}</strong><a className="primary-button" href={`/learn/${nextLesson.slug}?grade=${grade}${demo ? "&demo=1" : ""}`}>Start one small step <span aria-hidden="true">→</span></a></div>
          </footer>
        </section>}

        <div className="dashboard-grid">
          {reviewBatchSize > 0 ? <section className="next-card review-priority-card">
            <div className="next-visual review-priority-visual" role="img" aria-label={`${reviewBatchSize} ideas ready for Daily Review`}><span>{String(reviewBatchSize).padStart(2, "0")}</span><div className="review-priority-orbit"><b>◇</b>{Array.from({ length: reviewBatchSize }, (_, index) => <i key={index} />)}</div><small>MEMORY PATH</small></div>
            <div className="next-copy"><span className="section-kicker">TODAY’S BEST STEP · REVIEW READY</span><h2>Recharge today’s ideas.</h2><p>{reviewBatchSize === 1 ? "One quick recall is due. Strengthen it before adding new material." : `${reviewBatchSize} quick recalls are due. Strengthen them before adding new material.`}</p><div className="next-meta"><span>◷ about 5 min</span><span>◇ {reviewBatchSize} {reviewBatchSize === 1 ? "recall" : "recalls"}</span><span>◆ 20 XP</span></div><a className="primary-button" href={`/review?grade=${grade}${demo ? "&demo=1" : ""}`}>Start Daily Review <span aria-hidden="true">→</span></a></div>
          </section> : <section className="next-card">
            <div className={`next-visual accent-${nextLesson.accent}`}><span>{String(curriculum.regions.find((item) => item.id === nextLesson.regionId)?.order ?? 1).padStart(2, "0")}</span><TopicIcon visual={nextLesson.visual} accent={nextLesson.accent} size="xl" label={`${nextLesson.title} topic icon`} /></div>
            <div className="next-copy"><span className="section-kicker">GRADE {grade} · UP NEXT</span><h2>{nextLesson.title}</h2><p>{nextLesson.goal}</p><div className="next-meta"><span>◷ 6–8 min</span><span>◆ 40 XP</span><span>☆ 3 stars</span></div><a className="primary-button" href={`/learn/${nextLesson.slug}?grade=${grade}${demo ? "&demo=1" : ""}`}>Continue lesson <span aria-hidden="true">→</span></a></div>
          </section>}

          <aside className={`daily-card ${state.dailyRewardClaimed ? "claimed" : ""}`}>
            <div className="daily-card-top"><span className="daily-icon" aria-hidden="true">◆</span><span className="section-kicker">DAILY TRAIL REWARD</span></div>
            <h2>{state.dailyRewardClaimed ? `${visibleRewardAmount} tokens collected` : `Claim ${visibleRewardAmount} tokens`}</h2>
            <div className="reward-calendar" aria-label="Seven-claim reward cycle" role="list">
              {dailyRewardAmounts.map((amount, index) => <span className={rewardCellClass(index + 1)} role="listitem" aria-label={`Claim ${index + 1}: ${amount} Trail Tokens${index === 6 ? " and a Streak Shield" : ""}`} key={amount}><small>{index + 1}</small><b>{amount}{index === 6 ? "+◇" : ""}</b></span>)}
            </div>
            <button className="secondary-button full-button" type="button" disabled={state.dailyRewardClaimed} onClick={claimReward}>{state.dailyRewardClaimed ? "Come back tomorrow" : "Claim today’s reward"}</button>
            {rewardMessage.startsWith("+") && <div className="reward-callout" role="status"><span aria-hidden="true">✦</span><strong>{rewardMessage}</strong></div>}
            <p className="reward-note" aria-live="polite">{rewardMessage || `Claim ${nextRewardStep} of 7. Miss a day? This path waits for you.`}</p>
            <a className="reward-locker-link" href={`/profile${demo ? "?demo=1" : ""}`}><span aria-hidden="true">◇</span><div><strong>Use tokens for permanent frames</strong><small>Open your private Avatar Locker</small></div><b aria-hidden="true">→</b></a>
          </aside>
        </div>

        <section className={`quest-tracker accent-${activeRegion.accent}`} aria-labelledby="current-quest-heading">
          <div className="quest-visual"><TopicIcon visual={activeRegion.lessons[0].visual} accent={activeRegion.accent} size="lg" label={`${activeRegion.title} current quest`} /><span>{String(activeRegion.order).padStart(2, "0")}</span></div>
          <div className="quest-copy">
            <span className="section-kicker">CURRENT QUEST · {activeRegion.standard}</span>
            <h2 id="current-quest-heading">{activeRegion.title}</h2>
            <p>{gradeComplete ? `Grade ${grade} trail cleared. Daily Review will keep your strongest skills fresh.` : activeBossReady ? "All four lessons are complete. Your boss quest is ready—take your time and use all three hearts." : `${activeRegion.lessons.length - activeDone} short ${activeRegion.lessons.length - activeDone === 1 ? "lesson" : "lessons"} until the boss quest. Corrections count as progress.`}</p>
            <div className="quest-progress" aria-label={`${activeDone} of ${activeRegion.lessons.length} lessons complete`}><span style={{ width: `${activeDone / activeRegion.lessons.length * 100}%` }} /></div>
            <div className="quest-nodes" aria-label="Current quest progress">
              {activeRegion.lessons.map((item, index) => {
                const done = completed.has(item.id);
                const current = !done && item.id === activeNextLesson?.id;
                return <span className={`quest-node ${done ? "done" : current ? "current" : "locked"}`} aria-label={`${item.title}: ${done ? "complete" : current ? "next" : "locked"}`} key={item.id}>{done ? "✓" : index + 1}</span>;
              })}
              <i className="quest-connector" aria-hidden="true" />
              <span className={`quest-node quest-boss-node ${gradeComplete ? "done" : activeBossReady ? "current" : "locked"}`} aria-label={`Boss quest: ${gradeComplete ? "complete" : activeBossReady ? "ready" : "locked"}`}>★</span>
            </div>
          </div>
          <div className="quest-action"><span>{gradeComplete ? "TRAIL CLEARED" : activeBossReady ? "BOSS READY" : `STEP ${activeDone + 1} OF ${activeRegion.lessons.length}`}</span><strong>{gradeComplete ? "Keep your mastery moving" : activeBossReady ? "5 mixed questions" : activeNextLesson?.title}</strong><a className="primary-button" href={questHref}>{gradeComplete ? "Open Daily Review" : activeBossReady ? "Start boss quest" : "Continue quest"} <span aria-hidden="true">→</span></a></div>
        </section>

        <section className="trail-overview">
          <div className="section-heading split-heading compact-heading"><div><span className="section-kicker">GRADE {grade}</span><h2>Learning map</h2></div><div className="map-controls"><p>{showFullMap ? `Showing all ${curriculum.regions.length} regions.` : "Showing your current region and nearby trail."} Stars do not block progress.</p><button type="button" aria-expanded={showFullMap} aria-controls="grade-map" onClick={() => setShowFullMap((value) => !value)}>{showFullMap ? "Focus on current quest" : `Show full Grade ${grade} map`}</button></div></div>
          {!showFullMap && <p className="map-window-note" role="status"><span aria-hidden="true">◎</span> A focused map keeps your next step close. You can open the full trail anytime.</p>}
          <div className="world-list" id="grade-map">
            {visibleRegions.map((region) => {
              const regionIndex = curriculum.regions.findIndex((item) => item.id === region.id);
              const regionComplete = region.lessons.every((item) => completed.has(item.id));
              const previousCleared = regionIndex === 0 || cleared.has(curriculum.regions[regionIndex - 1].id);
              const bossCleared = cleared.has(region.id);
              const landmark = getRegionLandmark(grade, region.id);
              return (
                <article className={`world-card accent-${region.accent} ${previousCleared ? "unlocked" : "world-locked"}`} id={`region-${region.id}`} key={region.id}>
                  <header className={`world-header ${landmark ? "with-landmark" : ""}`}><div className="world-marker"><TopicIcon visual={region.lessons[0].visual} accent={region.accent} size="md" label={`${region.title} region icon`} /><span className="world-number">{String(region.order).padStart(2, "0")}</span></div><div className="world-copy"><span>{region.standard}</span><h3>{region.title}</h3><p>{region.subtitle}</p></div>{landmark && <div className="world-landmark"><Image src={landmark.src} width={360} height={240} sizes="(max-width: 760px) 86vw, 140px" alt={landmark.alt} /><span aria-hidden="true">VISUAL LANDMARK</span></div>}<span className="world-status">{bossCleared ? "Cleared" : previousCleared ? `${region.lessons.filter((item) => completed.has(item.id)).length}/4` : "Locked"}</span></header>
                  <div className="world-path">
                    {region.lessons.map((item, index) => {
                      const stars = completed.get(item.id);
                      const priorLessonComplete = index === 0 || completed.has(region.lessons[index - 1].id);
                      const available = previousCleared && (Boolean(stars) || priorLessonComplete);
                      const content = <><TopicIcon visual={item.visual} accent={item.accent} size="sm" /><span className="path-copy"><small>{stars ? "COMPLETE" : `LESSON ${String(index + 1).padStart(2, "0")}`}</small><span className="path-title">{item.title}</span></span><span className="path-stars" aria-label={stars ? `${stars} stars` : available ? "Ready" : "Locked"}>{stars ? `${"★".repeat(stars)}${"☆".repeat(3 - stars)}` : available ? "Ready →" : "·"}</span></>;
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
