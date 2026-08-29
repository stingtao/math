"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getGradeCurriculum, getGradeLessons } from "@/lib/curriculum";
import { getRegionLandmark } from "@/lib/visual-landmarks";
import { saveDemoState } from "@/lib/learner-state";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";
import { achievementTotalsForState, achievementUnlockedBetween, type AchievementSpec } from "@/lib/achievements";
import { PrivateLandmarkUnlock } from "./PrivateLandmarkUnlock";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { getThemeSpec } from "@/lib/themes";
import { getLessonExperience } from "@/lib/lesson-experience";
import { LessonMissionThumbnail } from "./LessonMissionStory";

const dailyRewardAmounts = [10, 12, 14, 16, 18, 20, 30];

export function LearningDashboard({ demo, grade }: { demo: boolean; grade: number }) {
  const { state, setState, loading, error, isDemo } = useLearner(demo);
  const [rewardMessage, setRewardMessage] = useState("");
  const [rewardLandmark, setRewardLandmark] = useState<AchievementSpec | null>(null);
  const [rewardPending, setRewardPending] = useState(false);
  const [showClaimedReward, setShowClaimedReward] = useState(false);
  const [showFullMap, setShowFullMap] = useState(true);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    try { setWelcomeDismissed(window.sessionStorage.getItem("math-welcome-guide") === "dismissed"); }
    catch { setWelcomeDismissed(false); }
    setWelcomeReady(true);
  }, []);

  useEffect(() => {
    if (!showClaimedReward || !state?.dailyRewardClaimed) return;
    const timer = window.setTimeout(() => {
      setShowClaimedReward(false);
      setRewardMessage("");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [showClaimedReward, state?.dailyRewardClaimed]);

  const completed = useMemo(() => new Map(state?.completedLessons.map((item) => [item.id, item.stars]) ?? []), [state]);
  const cleared = useMemo(() => new Set(state?.clearedBosses.map((item) => item.regionId) ?? []), [state]);
  const curriculum = getGradeCurriculum(grade);
  const gradeLessons = getGradeLessons(grade);
  const nextLesson = gradeLessons.find((item) => !completed.has(item.id)) ?? gradeLessons[gradeLessons.length - 1];
  const activeRegionIndexRaw = curriculum.regions.findIndex((item) => !cleared.has(item.id));
  const gradeComplete = activeRegionIndexRaw === -1;
  const activeRegionIndex = activeRegionIndexRaw === -1 ? Math.max(0, curriculum.regions.length - 1) : activeRegionIndexRaw;
  const activeRegion = curriculum.regions[activeRegionIndex];
  const activeDone = activeRegion.lessons.filter((item) => completed.has(item.id)).length;
  const activeNextLesson = activeRegion.lessons.find((item) => !completed.has(item.id));
  const activeBossReady = activeDone === activeRegion.lessons.length;
  const reviewBatchSize = Math.min(state?.dueReview ?? 0, 5);
  const featuredLesson = activeNextLesson ?? nextLesson;
  const featuredExperience = getLessonExperience(featuredLesson);
  const visibleRegions = showFullMap ? curriculum.regions : gradeComplete || !activeRegion ? [] : [activeRegion];

  if (loading) return <LoadingTrail />;
  if (!state || error) return <SignInGate />;
  const world = getThemeSpec(state.profile.theme);

  async function claimReward() {
    if (state!.dailyRewardClaimed || rewardPending) return;
    setRewardPending(true);
    setRewardMessage("");
    setRewardLandmark(null);
    try {
      if (isDemo) {
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
        setShowClaimedReward(true);
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
        setShowClaimedReward(true);
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
  const showWelcomeGuide = welcomeReady && state.completedLessons.length === 0 && !welcomeDismissed;
  const dailyCardVisible = !state.dailyRewardClaimed || showClaimedReward;

  function dismissWelcomeGuide() {
    try { window.sessionStorage.setItem("math-welcome-guide", "dismissed"); } catch { /* Device storage is optional. */ }
    setWelcomeDismissed(true);
  }

  return (
    <main className="learner-shell">
      <LearnerHeader state={state} demo={isDemo} />
      {rewardMessage.startsWith("Collected") && <SuccessBurst eventKey={`daily-${state.profile.rewardStep}`} />}
      {isDemo && <div className="demo-banner"><span>Preview mode</span><p>Try anything. This progress lasts only in this browser.</p><a href="/#join">Sign in to save it</a></div>}
      <section className="dashboard-wrap">
        <nav className="grade-switcher" aria-label="Choose a grade">
          {[7, 8, 9, 10, 11, 12].map((item) => <a className={item === grade ? "active" : ""} href={`/learn?grade=${item}${isDemo ? "&demo=1" : ""}`} key={item}>Grade {item}</a>)}
        </nav>

        {showWelcomeGuide && <section className={`welcome-trail-guide welcome-first-mission accent-${nextLesson.accent}`} aria-labelledby="welcome-trail-heading">
          <button className="welcome-guide-close" type="button" onClick={dismissWelcomeGuide} aria-label="Dismiss welcome guide">×</button>
          <div className="welcome-first-mission-copy">
            <span className="section-kicker">WELCOME, {world.role.toUpperCase()}</span>
            <h2 id="welcome-trail-heading">Start with {nextLesson.title}.</h2>
            <p>{getLessonExperience(nextLesson).title}</p>
            <div className="next-meta"><span>◷ 6–8 min</span><span>↻ Hints + retries</span></div>
            <a className="primary-button mission-primary-cta" href={`/learn/${nextLesson.slug}?grade=${grade}${isDemo ? "&demo=1" : ""}`}>Start first mission <span aria-hidden="true">→</span></a>
          </div>
          <div className="welcome-first-mission-visual"><LessonMissionThumbnail lesson={nextLesson} /></div>
        </section>}

        {!showWelcomeGuide && <section className="today-mission-board" aria-label="Your next move">
          <div className={`dashboard-grid ${dailyCardVisible ? "" : "mission-only"}`}>
          {reviewBatchSize > 0 ? <section className="next-card review-priority-card">
            <div className="next-visual review-priority-visual" role="img" aria-label={`${reviewBatchSize} ideas ready for Daily Review`}><span>{String(reviewBatchSize).padStart(2, "0")}</span><div className="review-priority-orbit"><b>◇</b>{Array.from({ length: reviewBatchSize }, (_, index) => <i key={index} />)}</div><small>MEMORY PATH</small></div>
            <div className="next-copy"><span className="section-kicker">YOUR NEXT MOVE · REVIEW READY</span><h2>Keep this skill ready.</h2><p>{reviewBatchSize === 1 ? "One idea is ready for a fast recall." : `${reviewBatchSize} ideas are ready for a fast recall.`}</p><div className="next-meta"><span>◷ about 5 min</span><span>◇ {reviewBatchSize} {reviewBatchSize === 1 ? "recall" : "recalls"}</span><span>◆ 20 XP</span></div><a className="primary-button mission-primary-cta" href={`/review?grade=${grade}${isDemo ? "&demo=1" : ""}`}>Start the recall <span aria-hidden="true">→</span></a></div>
          </section> : gradeComplete ? <section className="next-card trail-complete-card">
            <div className={`next-visual trail-complete-visual accent-${activeRegion.accent}`}><span>{String(curriculum.regions.length).padStart(2, "0")}</span><TopicIcon visual={activeRegion.lessons[3].visual} accent={activeRegion.accent} size="xl" label={`Grade ${grade} trail complete`} /><b aria-hidden="true">✓</b><small>TRAIL CLEARED</small></div>
            <div className="next-copy"><span className="section-kicker">GRADE {grade} · ALL CLEAR</span><h2>You finished what was due.</h2><p>Stop here, or open the map when you want to replay a skill.</p><div className="next-meta"><span>✓ Grade route complete</span><span>◇ review returns later</span></div><button className="secondary-button" type="button" onClick={() => setShowFullMap(true)}>Open replay map <span aria-hidden="true">↓</span></button></div>
          </section> : activeBossReady ? <section className="next-card boss-priority-card">
            <div className={`next-visual boss-priority-visual accent-${activeRegion.accent}`}><span>{String(activeRegion.order).padStart(2, "0")}</span><TopicIcon visual={activeRegion.lessons[0].visual} accent={activeRegion.accent} size="xl" label={`${activeRegion.title} boss quest`} /><b aria-hidden="true">★</b><small>4 KEYS COLLECTED</small></div>
            <div className="next-copy"><span className="section-kicker">YOUR NEXT MOVE · BOSS READY</span><h2>{activeRegion.title} Boss</h2><p>Use all {activeRegion.lessons.length} lesson ideas in {activeRegion.lessons.length + 1} questions. No timer. A miss opens a repair path.</p><div className="next-meta"><span>♥ 3 hearts</span><span>◇ {activeRegion.lessons.length + 1} mixed questions</span><span>◆ 100 XP</span></div><a className="primary-button mission-primary-cta" href={`/boss/${activeRegion.id}?grade=${grade}${isDemo ? "&demo=1" : ""}`}>Start the challenge <span aria-hidden="true">→</span></a></div>
          </section> : <section className="next-card">
            <div className={`next-visual accent-${featuredLesson.accent}`}><span>{String(activeRegion.order).padStart(2, "0")}</span><LessonMissionThumbnail lesson={featuredLesson} /></div>
            <div className="next-copy"><span className="section-kicker">GRADE {grade} · YOUR NEXT MOVE</span><h2>{featuredLesson.title}</h2><p>{featuredExperience.title}</p><div className="next-meta"><span>◷ 6–8 min</span><span>◆ 40 XP + star bonus</span><span>☆ 3-star goal</span></div><a className="primary-button mission-primary-cta" href={`/learn/${featuredLesson.slug}?grade=${grade}${isDemo ? "&demo=1" : ""}`}>Start this mission <span aria-hidden="true">→</span></a></div>
          </section>}

          {dailyCardVisible && <aside className={`daily-card ${state.dailyRewardClaimed ? "claimed claim-settling" : "ready"}`} aria-labelledby="daily-reward-heading">
            <div className="daily-card-top">
              <div><span className="daily-icon" aria-hidden="true">◆</span><span className="section-kicker">OPTIONAL DAILY CHECK-IN</span></div>
              <span className="reward-balance" aria-label={`${state.profile.trailTokens} Trail Tokens available`}>◇ {state.profile.trailTokens}</span>
            </div>
            {state.dailyRewardClaimed ? <div className="reward-collected-status" role="status" aria-live="polite">
              <span aria-hidden="true">✓</span>
              <div><h2 id="daily-reward-heading">Collected today</h2><p>{rewardMessage || "Trail Tokens added."}</p></div>
            </div> : <>
              <div className="daily-reward-hero">
                <span className="daily-token-medallion" aria-hidden="true"><b>+{visibleRewardAmount}</b></span>
                <div className="daily-reward-heading">
                  <h2 id="daily-reward-heading">Tokens ready</h2>
                  <p>Claim now · ▲ {state.profile.currentStreak} day streak</p>
                </div>
              </div>
              <button className="full-button reward-claim-button reward-ready-button" type="button" disabled={rewardPending} aria-busy={rewardPending} onClick={claimReward}>{rewardPending ? "Collecting…" : `Collect +${visibleRewardAmount} tokens`} <span aria-hidden="true">◆</span></button>
              {rewardMessage && <div className="reward-callout error" role="alert"><span aria-hidden="true">!</span><strong>{rewardMessage}</strong></div>}
            </>}
            {rewardLandmark && <PrivateLandmarkUnlock achievement={rewardLandmark} demo={isDemo} compact />}
          </aside>}
          </div>
        </section>}

        <section className={`trail-overview ${showFullMap ? "expanded-map" : "focused-map"}`}>
          <div className="section-heading split-heading compact-heading"><div><span className="section-kicker">GRADE {grade} · {world.worldName.toUpperCase()}</span><h2>{world.mapLabel}</h2></div><div className="map-controls"><p>{showFullMap ? "Choose any open lesson to replay." : gradeComplete ? "This grade route is complete." : `${activeRegion.title} · ${activeDone}/${activeRegion.lessons.length} steps`}</p><button type="button" aria-expanded={showFullMap} aria-controls="grade-map" onClick={() => setShowFullMap((value) => !value)}>{showFullMap ? "Show current region" : gradeComplete ? "Explore completed map" : "View full map"}</button></div></div>
          {!visibleRegions.length && !showFullMap && <div className="map-complete-note"><span aria-hidden="true">✓</span><strong>No map action is waiting.</strong><p>Use the button above only when you want to replay a lesson.</p></div>}
          <div className="world-list" id="grade-map">
            {visibleRegions.map((region) => {
              const regionIndex = curriculum.regions.findIndex((item) => item.id === region.id);
              const regionComplete = region.lessons.every((item) => completed.has(item.id));
              const previousCleared = regionIndex === 0 || cleared.has(curriculum.regions[regionIndex - 1].id);
              const bossCleared = cleared.has(region.id);
              const landmark = getRegionLandmark(grade, region.id);
              const regionDone = region.lessons.filter((item) => completed.has(item.id)).length;
              const regionLabel = bossCleared ? "EXPLORED" : region.id === activeRegion.id ? "CURRENT REGION" : previousCleared ? "NEXT REGION" : "LOCKED REGION";
              return (
                <article className={`world-card accent-${region.accent} ${previousCleared ? "unlocked" : "world-locked"} ${bossCleared ? "completed-summary" : ""}`} aria-label={`${region.title}: ${bossCleared ? "explored" : previousCleared ? `${regionDone} of ${region.lessons.length} lessons complete` : "locked"}`} id={`region-${region.id}`} key={region.id}>
                  <header className={`world-header ${landmark && previousCleared && !bossCleared ? "with-landmark" : ""}`}><div className="world-marker"><TopicIcon visual={region.lessons[0].visual} accent={region.accent} size="md" label={`${region.title} region icon`} /><span className="world-number">{String(region.order).padStart(2, "0")}</span></div><div className="world-copy"><span>{regionLabel}</span><h3>{region.title}</h3>{!bossCleared && <p>{region.subtitle}</p>}</div>{landmark && previousCleared && !bossCleared && <div className="world-landmark"><Image src={landmark.src} width={360} height={240} sizes="(max-width: 760px) 86vw, 140px" alt={landmark.alt} /><span aria-hidden="true">LANDMARK</span></div>}<span className="world-status">{bossCleared ? "✓" : previousCleared ? `${regionDone}/${region.lessons.length}` : "Locked"}</span></header>
                  {bossCleared ? <a className="world-replay-link" href={`/learn/${region.lessons[0].slug}?grade=${grade}${isDemo ? "&demo=1" : ""}`}>Replay this region <span aria-hidden="true">→</span></a> : previousCleared ? <div className="world-path">
                    {region.lessons.map((item, index) => {
                      const stars = completed.get(item.id);
                      const priorLessonComplete = index === 0 || completed.has(region.lessons[index - 1].id);
                      const available = previousCleared && (Boolean(stars) || priorLessonComplete);
                      const content = <><TopicIcon visual={item.visual} accent={item.accent} size="sm" /><span className="path-copy"><small>{stars ? "✓" : available ? "NEXT" : `STEP ${index + 1}`}</small><span className="path-title">{item.title}</span></span><span className="path-stars" aria-label={stars ? `${stars} stars` : available ? "Ready" : "Locked"}>{stars ? `${"★".repeat(stars)}${"☆".repeat(3 - stars)}` : available ? "Ready →" : "·"}</span></>;
                      return available ? <a className={`path-lesson ${stars ? "complete" : "current"}`} href={`/learn/${item.slug}?grade=${grade}${isDemo ? "&demo=1" : ""}`} key={item.id}>{content}</a> : <div className="path-lesson locked" key={item.id}>{content}</div>;
                    })}
                    {regionComplete ? <a className="boss-node ready" href={`/boss/${region.id}?grade=${grade}${isDemo ? "&demo=1" : ""}`}><span>★</span><strong>Boss ready</strong><small>5 mixed questions</small></a> : <div className="boss-node locked"><span>☆</span><strong>Region boss</strong><small>Clear the four steps</small></div>}
                  </div> : <div className="world-lock-preview"><span aria-hidden="true">◇</span><strong>Clear {curriculum.regions[regionIndex - 1]?.title ?? "the previous region"} to reach this region.</strong></div>}
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
