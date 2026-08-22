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
import { achievementTotalsForState, achievementUnlockedBetween, getNextAchievement, type AchievementSpec } from "@/lib/achievements";
import { PrivateLandmarkUnlock } from "./PrivateLandmarkUnlock";
import { getQuestMilestone } from "@/lib/quest-milestone";
import { LearningLoading, LearningSignInGate } from "./LearningGate";

const dailyRewardAmounts = [10, 12, 14, 16, 18, 20, 30];

export function LearningDashboard({ demo, grade }: { demo: boolean; grade: number }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [rewardMessage, setRewardMessage] = useState("");
  const [rewardLandmark, setRewardLandmark] = useState<AchievementSpec | null>(null);
  const [rewardPending, setRewardPending] = useState(false);
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
  const featuredLesson = activeNextLesson ?? nextLesson;
  const focusedStart = Math.max(0, activeRegionIndex - 1);
  const focusedEnd = Math.min(curriculum.regions.length, activeRegionIndex + 2);
  const visibleRegions = showFullMap ? curriculum.regions : curriculum.regions.slice(focusedStart, focusedEnd);
  const questHref = gradeComplete
    ? reviewBatchSize > 0 ? `/review?grade=${grade}${demo ? "&demo=1" : ""}` : "#grade-map"
    : activeBossReady
    ? `/boss/${activeRegion.id}?grade=${grade}${demo ? "&demo=1" : ""}`
    : `/learn/${activeNextLesson?.slug ?? activeRegion.lessons[0].slug}?grade=${grade}${demo ? "&demo=1" : ""}`;

  if (loading) return <LoadingTrail />;
  if (!state || error) return <SignInGate />;
  const totalStars = state.completedLessons.reduce((sum, item) => sum + item.stars, 0);
  const nextPrivateAchievement = getNextAchievement({
    lessons: state.completedLessons.length,
    stars: totalStars,
    bosses: state.clearedBosses.length,
    streak: state.profile.longestStreak,
  });

  async function claimReward() {
    if (state!.dailyRewardClaimed || rewardPending) return;
    setRewardPending(true);
    setRewardMessage("");
    setRewardLandmark(null);
    try {
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
        const landmark = achievementUnlockedBetween(achievementTotalsForState(state!), achievementTotalsForState(next));
        setRewardLandmark(landmark?.source === "streak" ? landmark : null);
        saveDemoState(next);
        setState(next);
        setRewardMessage(`Collected +${tokens} Trail Tokens${step === 7 ? " and one Streak Shield" : ""}.`);
        return;
      }
      const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "claimDaily", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) });
      const body = await response.json() as { state?: typeof state; reward?: { tokens: number; shield?: boolean }; error?: string };
      if (response.ok && body.state) {
        const landmark = achievementUnlockedBetween(achievementTotalsForState(state!), achievementTotalsForState(body.state));
        setRewardLandmark(landmark?.source === "streak" ? landmark : null);
        setState(body.state);
        const tokens = body.reward?.tokens ?? dailyRewardAmounts[body.state.profile.rewardStep - 1] ?? 0;
        setRewardMessage(`Collected +${tokens} Trail Tokens${body.reward?.shield ? " and one Streak Shield" : ""}.`);
      } else setRewardMessage(body.error ?? "Your reward could not be claimed. Please try again.");
    } catch {
      setRewardMessage("Your reward could not be claimed. Check your connection and try again.");
    } finally {
      setRewardPending(false);
    }
  }

  const nextRewardStep = (state.profile.rewardStep % 7) + 1;
  const visibleRewardStep = state.dailyRewardClaimed ? state.profile.rewardStep : nextRewardStep;
  const visibleRewardAmount = dailyRewardAmounts[visibleRewardStep - 1];
  const followingRewardStep = (visibleRewardStep % 7) + 1;
  const followingRewardAmount = dailyRewardAmounts[followingRewardStep - 1];
  const showWelcomeGuide = welcomeReady && state.completedLessons.length === 0 && !welcomeDismissed;
  const mainMissionDone = gradeComplete && reviewBatchSize === 0;
  const mainMissionTitle = reviewBatchSize > 0
    ? `${reviewBatchSize} quick ${reviewBatchSize === 1 ? "recall" : "recalls"}`
    : gradeComplete
    ? "Nothing due today"
    : activeBossReady
    ? `${activeRegion.title} Boss`
    : featuredLesson.title;
  const mainMissionType = reviewBatchSize > 0 ? "Daily Review" : gradeComplete ? "Trail complete" : activeBossReady ? "Boss quest" : "Short lesson";
  const questMilestone = getQuestMilestone({ gradeComplete, reviewBatchSize, activeBossReady, activeDone, regionSize: activeRegion.lessons.length, nextLessonTitle: activeNextLesson?.title });

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
      {rewardMessage.startsWith("Collected") && <SuccessBurst eventKey={`daily-${state.profile.rewardStep}`} />}
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
            <div className="welcome-first-win" aria-label="First lesson reward preview: one of four region keys, at least 40 XP, and the next lesson opens">
              <header><span aria-hidden="true">✦</span><div><small>FIRST WIN PREVIEW</small><strong>Finish all five—even after corrections.</strong></div></header>
              <div className="welcome-first-win-rewards" role="list">
                <span role="listitem"><b>1/4</b><strong>Region key</strong><small>Boss path begins</small></span>
                <span role="listitem"><b>+40</b><strong>Base XP</strong><small>Star bonus possible</small></span>
                <span role="listitem"><b>→</b><strong>Next lesson</strong><small>Opens right away</small></span>
              </div>
              <p><span aria-hidden="true">✓</span><strong>Stars are feedback.</strong> First tries add sparkle; corrected work still unlocks everything.</p>
            </div>
            <div className="welcome-guide-action"><small>YOUR FIRST QUEST</small><strong>{nextLesson.title}</strong><a className="primary-button" href={`/learn/${nextLesson.slug}?grade=${grade}${demo ? "&demo=1" : ""}`}>Start one small step <span aria-hidden="true">→</span></a></div>
          </footer>
        </section>}

        <section className="today-mission-board" aria-labelledby="today-mission-heading">
          <header className="today-mission-header">
            <div><span className="section-kicker">TODAY’S MISSION BOARD</span><h2 id="today-mission-heading">{mainMissionDone ? "Nothing is required today." : "One clear math step. Then stop."}</h2><p>Daily check-in is optional. Your learning progress never resets when you miss a day.</p></div>
            <div className="today-mission-route" aria-label={`Daily check-in ${state.dailyRewardClaimed ? "collected" : "ready and optional"}; main math step: ${mainMissionTitle}`}>
              <span className={state.dailyRewardClaimed ? "done" : "optional"}><b aria-hidden="true">{state.dailyRewardClaimed ? "✓" : "◆"}</b><small>OPTIONAL CHECK-IN</small><strong>{state.dailyRewardClaimed ? "Reward saved" : `+${visibleRewardAmount} tokens ready`}</strong></span>
              <i aria-hidden="true" />
              <span className={mainMissionDone ? "done" : "current"}><b aria-hidden="true">{mainMissionDone ? "✓" : "→"}</b><small>MAIN · {mainMissionType.toUpperCase()}</small><strong>{mainMissionTitle}</strong></span>
            </div>
          </header>

          <div className="dashboard-grid">
          {reviewBatchSize > 0 ? <section className="next-card review-priority-card">
            <div className="next-visual review-priority-visual" role="img" aria-label={`${reviewBatchSize} ideas ready for Daily Review`}><span>{String(reviewBatchSize).padStart(2, "0")}</span><div className="review-priority-orbit"><b>◇</b>{Array.from({ length: reviewBatchSize }, (_, index) => <i key={index} />)}</div><small>MEMORY PATH</small></div>
            <div className="next-copy"><span className="section-kicker">TODAY’S BEST STEP · REVIEW READY</span><h2>Recharge today’s ideas.</h2><p>{reviewBatchSize === 1 ? "One quick recall is due. Strengthen it before adding new material." : `${reviewBatchSize} quick recalls are due. Strengthen them before adding new material.`}</p><div className="next-meta"><span>◷ about 5 min</span><span>◇ {reviewBatchSize} {reviewBatchSize === 1 ? "recall" : "recalls"}</span><span>◆ 20 XP</span></div><a className="primary-button" href={`/review?grade=${grade}${demo ? "&demo=1" : ""}`}>Start Daily Review <span aria-hidden="true">→</span></a></div>
          </section> : gradeComplete ? <section className="next-card trail-complete-card">
            <div className={`next-visual trail-complete-visual accent-${activeRegion.accent}`}><span>{String(curriculum.regions.length).padStart(2, "0")}</span><TopicIcon visual={activeRegion.lessons[3].visual} accent={activeRegion.accent} size="xl" label={`Grade ${grade} trail complete`} /><b aria-hidden="true">✓</b><small>TRAIL CLEARED</small></div>
            <div className="next-copy"><span className="section-kicker">GRADE {grade} · NOTHING DUE</span><h2>Today’s trail is complete.</h2><p>Every lesson and boss is saved, and no review is waiting. This is enough for today.</p><div className="next-meta"><span>✓ {gradeLessons.length} lessons</span><span>★ {curriculum.regions.length} bosses</span><span>◇ review will return</span></div><a className="secondary-button" href="#grade-map">Revisit the completed trail <span aria-hidden="true">↓</span></a></div>
          </section> : activeBossReady ? <section className="next-card boss-priority-card">
            <div className={`next-visual boss-priority-visual accent-${activeRegion.accent}`}><span>{String(activeRegion.order).padStart(2, "0")}</span><TopicIcon visual={activeRegion.lessons[0].visual} accent={activeRegion.accent} size="xl" label={`${activeRegion.title} boss quest`} /><b aria-hidden="true">★</b><small>4 KEYS COLLECTED</small></div>
            <div className="next-copy"><span className="section-kicker">TODAY’S BEST STEP · BOSS READY</span><h2>{activeRegion.title} Boss</h2><p>Connect the four ideas in five mixed questions. Take your time—there is no countdown, and corrections restore the path.</p><div className="next-meta"><span>♥ 3 hearts</span><span>◇ 5 mixed questions</span><span>◆ 100 XP</span></div><a className="primary-button" href={`/boss/${activeRegion.id}?grade=${grade}${demo ? "&demo=1" : ""}`}>Start boss quest <span aria-hidden="true">→</span></a></div>
          </section> : <section className="next-card">
            <div className={`next-visual accent-${featuredLesson.accent}`}><span>{String(activeRegion.order).padStart(2, "0")}</span><TopicIcon visual={featuredLesson.visual} accent={featuredLesson.accent} size="xl" label={`${featuredLesson.title} topic icon`} /></div>
            <div className="next-copy"><span className="section-kicker">GRADE {grade} · UP NEXT</span><h2>{featuredLesson.title}</h2><p>{featuredLesson.goal}</p><div className="next-meta"><span>◷ 6–8 min</span><span>◆ 40 XP + star bonus</span><span>☆ 3 stars</span></div><a className="primary-button" href={`/learn/${featuredLesson.slug}?grade=${grade}${demo ? "&demo=1" : ""}`}>Continue lesson <span aria-hidden="true">→</span></a></div>
          </section>}

          <aside className={`daily-card ${state.dailyRewardClaimed ? "claimed" : "ready"}`} aria-labelledby="daily-reward-heading">
            <div className="daily-card-top">
              <div><span className="daily-icon" aria-hidden="true">◆</span><span className="section-kicker">OPTIONAL DAILY CHECK-IN</span></div>
              <span className="reward-balance" aria-label={`${state.profile.trailTokens} Trail Tokens available`}>◇ {state.profile.trailTokens}</span>
            </div>
            <div className="daily-reward-hero">
              <span className="daily-token-medallion" aria-hidden="true"><b>{state.dailyRewardClaimed ? "✓" : `+${visibleRewardAmount}`}</b><small>{state.dailyRewardClaimed ? "SAVED" : "TOKENS"}</small></span>
              <div className="daily-reward-heading">
                <h2 id="daily-reward-heading">{state.dailyRewardClaimed ? "Today’s reward is collected" : `Collect +${visibleRewardAmount} Trail Tokens`}</h2>
                <p>{state.dailyRewardClaimed ? `Next claim: +${followingRewardAmount} tokens${followingRewardStep === 7 ? " and a Streak Shield" : ""}.` : `Claim ${nextRewardStep} of 7 is ready. Every reward is fixed.`}</p>
              </div>
            </div>
            <button className="secondary-button full-button reward-claim-button" type="button" disabled={state.dailyRewardClaimed || rewardPending} aria-busy={rewardPending} onClick={claimReward}>{rewardPending ? "Collecting…" : state.dailyRewardClaimed ? "Collected today ✓" : `Collect +${visibleRewardAmount} tokens`}</button>
            {rewardMessage && <div className={`reward-callout ${rewardMessage.startsWith("Collected") ? "success" : "error"}`} role="status"><span aria-hidden="true">{rewardMessage.startsWith("Collected") ? "✦" : "!"}</span><strong>{rewardMessage}</strong></div>}
            {rewardLandmark && <PrivateLandmarkUnlock achievement={rewardLandmark} demo={demo} compact />}
            <div className="daily-rhythm" aria-label="Pressure-free streak status">
              <span><b>▲ {state.profile.currentStreak}</b><small>Current streak</small></span>
              <span><b>{state.profile.longestStreak}</b><small>Longest kept</small></span>
              <span><b>◇ {state.profile.streakShields}</b><small>Shields ready</small></span>
            </div>

            <details className="daily-reward-details" open={!state.dailyRewardClaimed}>
              <summary><span>Fixed seven-claim path</span><strong>{state.dailyRewardClaimed ? `Claim ${visibleRewardStep} complete` : `Claim ${nextRewardStep} ready`}</strong></summary>
              <div className="reward-calendar" aria-label="Seven-claim reward journey" role="list">
                {dailyRewardAmounts.map((amount, index) => {
                  const claimNumber = index + 1;
                  const cellClass = rewardCellClass(claimNumber);
                  return <span className={cellClass} role="listitem" aria-current={cellClass === "today" ? "step" : undefined} aria-label={`Claim ${claimNumber}: ${amount} Trail Tokens${index === 6 ? " and a Streak Shield" : ""}${cellClass === "done" ? ", collected" : cellClass === "today" ? ", ready today" : ""}`} key={amount}>
                    <small>{cellClass === "today" ? "TODAY" : `#${claimNumber}`}</small>
                    <i aria-hidden="true">{cellClass === "done" ? "✓" : claimNumber}</i>
                    <b>+{amount}</b>
                    {index === 6 && <em>+ shield</em>}
                  </span>;
                })}
              </div>
              <div className="reward-note">
                <strong>{state.dailyRewardClaimed ? `Claim ${followingRewardStep} of 7 comes next.` : "Skip a day? Nothing resets."}</strong>
                <span>{state.dailyRewardClaimed ? "Return another day when it works for you." : "This seven-claim path waits for you—no mystery boxes or paid boosts."}</span>
              </div>
              <div className="reward-shield" aria-label={`${state.profile.streakShields} Streak Shields available`}><span aria-hidden="true">◇</span><div><strong>{state.profile.streakShields > 0 ? `${state.profile.streakShields} Streak ${state.profile.streakShields === 1 ? "Shield" : "Shields"} ready` : "A Streak Shield waits at claim 7"}</strong><small>{state.profile.streakShields > 0 ? "One shield protects your streak after one missed day." : "It is earned automatically—never purchased."}</small></div></div>
            </details>

            <a className="reward-locker-link" href={`/profile${demo ? "?demo=1" : ""}`}><span aria-hidden="true">◇</span><div><strong>Use tokens for permanent frames</strong><small>Open your private Avatar Locker</small></div><b aria-hidden="true">→</b></a>
          </aside>
          </div>
        </section>

        <section className={`quest-tracker accent-${activeRegion.accent}`} aria-labelledby="current-quest-heading">
          <div className="quest-visual"><TopicIcon visual={activeRegion.lessons[0].visual} accent={activeRegion.accent} size="lg" label={`${activeRegion.title} current quest`} /><span>{String(activeRegion.order).padStart(2, "0")}</span></div>
          <div className="quest-copy">
            <span className="section-kicker">CURRENT QUEST · {activeRegion.standard}</span>
            <h2 id="current-quest-heading">{activeRegion.title}</h2>
            <p>{gradeComplete ? reviewBatchSize > 0 ? `Grade ${grade} is cleared, and ${reviewBatchSize} ${reviewBatchSize === 1 ? "idea is" : "ideas are"} ready for a quick review.` : `Grade ${grade} is cleared and nothing is due. Your progress is saved; revisit any lesson only when you want to.` : activeBossReady ? "All four lessons are complete. Your boss quest is ready—take your time and use all three hearts." : `${activeRegion.lessons.length - activeDone} short ${activeRegion.lessons.length - activeDone === 1 ? "lesson" : "lessons"} until the boss quest. Corrections count as progress.`}</p>
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
            <div className={`quest-milestone milestone-${questMilestone.tone}`} role="status" aria-label={`${questMilestone.kicker}: ${questMilestone.title}. ${questMilestone.badge}`}>
              <span aria-hidden="true">{questMilestone.glyph}</span>
              <div><small>{questMilestone.kicker}</small><strong>{questMilestone.title}</strong></div>
              <b>{questMilestone.badge}</b>
            </div>
          </div>
          <div className="quest-action">
            <span>{gradeComplete ? reviewBatchSize > 0 ? "REVIEW READY" : "TRAIL CLEARED" : activeBossReady ? "BOSS READY" : `STEP ${activeDone + 1} OF ${activeRegion.lessons.length}`}</span>
            <strong>{gradeComplete ? reviewBatchSize > 0 ? `${reviewBatchSize} quick ${reviewBatchSize === 1 ? "recall" : "recalls"}` : "Nothing due today" : activeBossReady ? "5 mixed questions" : activeNextLesson?.title}</strong>
            <a className={gradeComplete && reviewBatchSize === 0 ? "secondary-button" : "primary-button"} href={questHref}>{gradeComplete ? reviewBatchSize > 0 ? "Open Daily Review" : "Browse completed lessons" : activeBossReady ? "Start boss quest" : "Continue quest"} <span aria-hidden="true">{gradeComplete && reviewBatchSize === 0 ? "↓" : "→"}</span></a>
            {nextPrivateAchievement ? <a className={`quest-landmark accent-${nextPrivateAchievement.tone}`} href={`/profile${demo ? "?demo=1" : ""}#achievement-heading`} aria-label={`Next private landmark: ${nextPrivateAchievement.title}, ${nextPrivateAchievement.value} of ${nextPrivateAchievement.target} ${nextPrivateAchievement.unit}${nextPrivateAchievement.target === 1 ? "" : "s"}`}>
              <span className="quest-landmark-glyph" aria-hidden="true">{nextPrivateAchievement.glyph}</span>
              <span className="quest-landmark-copy"><small>NEXT PRIVATE LANDMARK</small><strong>{nextPrivateAchievement.title}</strong><span>{nextPrivateAchievement.value}/{nextPrivateAchievement.target} {nextPrivateAchievement.unit}{nextPrivateAchievement.target === 1 ? "" : "s"}</span><span className="quest-landmark-meter" role="progressbar" aria-label={`${nextPrivateAchievement.title} progress`} aria-valuemin={0} aria-valuemax={nextPrivateAchievement.target} aria-valuenow={Math.min(nextPrivateAchievement.value, nextPrivateAchievement.target)}><i style={{ width: `${nextPrivateAchievement.progress}%` }} /></span></span>
              <b aria-hidden="true">→</b>
            </a> : <a className="quest-landmark shelf-complete" href={`/profile${demo ? "?demo=1" : ""}#achievement-heading`}><span className="quest-landmark-glyph" aria-hidden="true">✓</span><span className="quest-landmark-copy"><small>PRIVATE LANDMARKS</small><strong>Shelf complete</strong><span>Every current badge is yours.</span></span><b aria-hidden="true">→</b></a>}
          </div>
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
  return <LearningLoading glyph="M" tone="blue" kicker="SCOUTING YOUR TRAIL" title="Finding your next small step…" detail="Your progress, rewards, and closest milestone are being lined up." />;
}

function SignInGate() {
  return <LearningSignInGate glyph="✦" kicker="YOUR TRAIL IS PRIVATE" title="Sign in to keep learning." detail="Your lessons and progress stay behind your anonymous profile." />;
}
