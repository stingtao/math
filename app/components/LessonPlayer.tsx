"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { LessonDefinition } from "@/lib/curriculum";
import { getGradeCurriculum, getGradeLessons, getRegion, isAnswerCorrect, nextLesson } from "@/lib/curriculum";
import { applyBadgeProgress, completeDemoLesson, creditDemoCorrectAnswer, type LearnerState } from "@/lib/learner-state";
import type { BadgeUnlock } from "@/lib/badges";
import { calculateLessonReward } from "@/lib/rewards";
import { nextMomentumRun } from "@/lib/momentum";
import { ConceptVisual } from "./ConceptVisual";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { MomentumRun } from "./MomentumRun";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";
import { achievementTotalsForState, achievementUnlockedBetween } from "@/lib/achievements";
import { PrivateLandmarkUnlock } from "./PrivateLandmarkUnlock";
import { mathInputMode } from "@/lib/math-input";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeUnlockReveal } from "./BadgeUnlockReveal";
import { AnswerImpact } from "./AnswerImpact";

const stageLabels = [
  { label: "Goal", icon: "◎" },
  { label: "See it", icon: "◫" },
  { label: "Key idea", icon: "◆" },
  { label: "Example", icon: "→" },
  { label: "Practice", icon: "✓" },
];

const practiceEncouragement = [
  "You found the first foothold.",
  "That method is taking shape.",
  "Three corrected—momentum is building.",
  "One more idea is connected.",
  "You closed the loop.",
];

const focusChargeLabels = ["Ready", "First spark", "Building rhythm", "Strong focus", "Almost clear", "Fully charged"];

type LessonCompletionReward = {
  previousStars: number;
  bestStars: number;
  firstCompletion: boolean;
  starsImproved: boolean;
  baseXp: number;
  starXp: number;
  xpEarned: number;
};

export function LessonPlayer({ lesson, demo }: { lesson: LessonDefinition; demo: boolean }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [stage, setStage] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [firstCorrect, setFirstCorrect] = useState<Record<string, boolean>>({});
  const [hinted, setHinted] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(1);
  const [completionReward, setCompletionReward] = useState<LessonCompletionReward | null>(null);
  const [focusStreak, setFocusStreak] = useState(0);
  const [bestFocusStreak, setBestFocusStreak] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [badgeUnlocks, setBadgeUnlocks] = useState<BadgeUnlock[]>([]);
  const [runId] = useState(() => crypto.randomUUID());
  const question = lesson.practice[questionIndex];
  const answerLocked = busy || feedback === "correct";
  const correctedCount = questionIndex + (feedback === "correct" ? 1 : 0);
  const firstTryCount = Object.values(firstCorrect).filter(Boolean).length;
  const firstTryAnswered = Object.keys(firstCorrect).length;
  const twoStarPathOpen = firstTryCount + (lesson.practice.length - firstTryAnswered) >= 4;
  const threeStarPathOpen = Object.values(firstCorrect).every(Boolean) && Object.keys(hinted).length === 0;
  const currentFirstTry = feedback === "correct" && Boolean(firstCorrect[question.id]) && !hinted[question.id];
  const region = getRegion(lesson.regionId);
  const completeMap = useMemo(() => new Map(state?.completedLessons.map((item) => [item.id, item.stars]) ?? []), [state]);

  useEffect(() => {
    if (!sheetOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSheetOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sheetOpen]);

  if (loading) return <LearningLoading glyph="M" tone="blue" kicker="SETTING UP YOUR STEP" title="Opening your lesson…" detail="Your goal, example, and practice path are almost ready." />;
  if (!state || error) return <LessonGate />;
  const activeState = state;
  const gradeLessons = getGradeLessons(lesson.grade);
  const lessonPosition = gradeLessons.findIndex((item) => item.id === lesson.id);
  const gradeCurriculum = getGradeCurriculum(lesson.grade);
  const regionPosition = gradeCurriculum.regions.findIndex((item) => item.id === lesson.regionId);
  const regionAvailable = regionPosition === 0 || state.clearedBosses.some((item) => item.regionId === gradeCurriculum.regions[regionPosition - 1]?.id);
  const priorLessonComplete = lesson.order === 1 || completeMap.has(gradeLessons[lessonPosition - 1]?.id);
  const isAvailable = completeMap.has(lesson.id) || regionAvailable && priorLessonComplete;
  const trailUrl = `/learn?grade=${lesson.grade}${demo ? "&demo=1" : ""}`;
  const lessonProgressPercent = Math.round(((stage + (stage === 4 ? correctedCount / lesson.practice.length : 0)) / stageLabels.length) * 100);
  const currentStageLabel = stage === 4 ? `Practice ${questionIndex + 1} of ${lesson.practice.length}` : stageLabels[stage].label;
  if (!isAvailable) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="locked-lesson"><span className="lock-large">·</span><span className="section-kicker">FOLLOW THE TRAIL</span><h1>This lesson is just ahead.</h1><p>Complete your current step first. The trail will bring you here next.</p><a className="primary-button" href={trailUrl}>Back to your trail <span>→</span></a></section></main>;

  function advanceStage() { setStage((value) => Math.min(4, value + 1)); }

  async function submitAnswer() {
    if (!answer.trim() || busy) return;
    setBusy(true);
    setErrorMessage("");
    const priorAttempts = attempts[question.id] ?? 0;
    try {
      let correct = isAnswerCorrect(answer, question.answer);
      if (demo && correct) {
        const badgeResult = creditDemoCorrectAnswer(activeState);
        setState(badgeResult.state);
        if (badgeResult.badgeUnlocks.length) setBadgeUnlocks(badgeResult.badgeUnlocks);
      } else if (!demo) {
        const response = await fetch("/api/answer", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ lessonId: lesson.id, questionId: question.id, answer, usedHint: Boolean(hinted[question.id]), runId }) });
        const body = await response.json() as { correct?: boolean; correctAnswers?: number; badgeUnlocks?: BadgeUnlock[]; error?: string };
        if (!response.ok) { setErrorMessage(body.error ?? "We could not check that answer."); return; }
        correct = Boolean(body.correct);
        if (correct && body.correctAnswers !== undefined) setState(applyBadgeProgress(activeState, body.correctAnswers, body.badgeUnlocks));
        if (body.badgeUnlocks?.length) setBadgeUnlocks(body.badgeUnlocks);
      }
      setAttempts((current) => ({ ...current, [question.id]: priorAttempts + 1 }));
      if (priorAttempts === 0) setFirstCorrect((current) => ({ ...current, [question.id]: correct }));
      const cleanFirstTry = correct && priorAttempts === 0 && !hinted[question.id];
      const nextStreak = nextMomentumRun({ current: focusStreak, best: bestFocusStreak }, cleanFirstTry);
      setFocusStreak(nextStreak.current);
      setBestFocusStreak(nextStreak.best);
      setFeedback(correct ? "correct" : "incorrect");
    } catch {
      setErrorMessage("Your answer is still here. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function continuePractice() {
    if (feedback !== "correct") return;
    if (questionIndex < lesson.practice.length - 1) {
      setQuestionIndex((value) => value + 1);
      setAnswer("");
      setFeedback("");
      setShowHint(false);
      return;
    }
    const correctFirst = Object.values(firstCorrect).filter(Boolean).length + (attempts[question.id] === undefined ? 1 : 0);
    const usedAnyHint = Object.keys(hinted).length > 0;
    const earnedStars = correctFirst === lesson.practice.length && !usedAnyHint ? 3 : correctFirst >= 4 ? 2 : 1;
    const previousStars = activeState.completedLessons.find((item) => item.id === lesson.id)?.stars ?? 0;
    const expectedReward = calculateLessonReward(previousStars, earnedStars);
    if (busy) return;
    setBusy(true);
    setErrorMessage("");
    setStars(earnedStars);
    try {
      if (demo) {
        const nextState = completeDemoLesson(activeState, lesson.id, earnedStars);
        const newlyEarned = nextState.badges.recent.filter((item) => !activeState.badges.earnedIds.includes(item.id));
        if (newlyEarned.length) setBadgeUnlocks(newlyEarned);
        setCompletionReward({
          previousStars,
          bestStars: expectedReward.bestStars,
          firstCompletion: expectedReward.firstCompletion,
          starsImproved: expectedReward.starsImproved,
          baseXp: expectedReward.baseXp,
          starXp: expectedReward.starXp,
          xpEarned: nextState.totalXp - activeState.totalXp,
        });
        setState(nextState);
      }
      else {
        const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(`${runId}-complete`), body: JSON.stringify({ action: "completeLesson", lessonId: lesson.id, runId }) });
        const body = await response.json() as Partial<LessonCompletionReward> & { stars?: number; state?: LearnerState; badgeUnlocks?: BadgeUnlock[]; error?: string };
        if (!response.ok) { setErrorMessage(body.error ?? "We could not save your progress."); return; }
        const runStars = body.stars ?? earnedStars;
        const savedBest = body.bestStars ?? body.state?.completedLessons.find((item) => item.id === lesson.id)?.stars ?? Math.max(previousStars, runStars);
        const xpEarned = body.xpEarned ?? Math.max(0, (body.state?.totalXp ?? activeState.totalXp) - activeState.totalXp);
        setStars(runStars);
        setCompletionReward({
          previousStars: body.previousStars ?? previousStars,
          bestStars: savedBest,
          firstCompletion: body.firstCompletion ?? previousStars === 0,
          starsImproved: body.starsImproved ?? (previousStars > 0 && savedBest > previousStars),
          baseXp: body.baseXp ?? (previousStars === 0 ? Math.min(40, xpEarned) : 0),
          starXp: body.starXp ?? Math.max(0, xpEarned - (previousStars === 0 ? Math.min(40, xpEarned) : 0)),
          xpEarned,
        });
        if (body.badgeUnlocks?.length) setBadgeUnlocks(body.badgeUnlocks);
        if (body.state) setState(body.state);
      }
      setFinished(true);
    } catch {
      setErrorMessage("Your progress is still here. Check your connection and save again.");
    } finally {
      setBusy(false);
    }
  }

  function useHint() {
    setShowHint(true);
    setFocusStreak(0);
    setHinted((current) => ({ ...current, [question.id]: true }));
  }

  if (finished) {
    const following = nextLesson(lesson);
    const regionFinished = lesson.order === 4;
    const reward = completionReward ?? { previousStars: 0, bestStars: stars, firstCompletion: true, starsImproved: false, baseXp: 40, starXp: stars === 3 ? 10 : stars === 2 ? 5 : 0, xpEarned: 40 + (stars === 3 ? 10 : stars === 2 ? 5 : 0) };
    const replayed = !reward.firstCompletion && !reward.starsImproved;
    const masteryMessage = reward.bestStars > stars ? `Best marker kept · ${reward.bestStars}/3` : stars === 3 ? "No-hint mastery" : stars === 2 ? "Strong first pass" : "Complete after corrections";
    const masteryNext = reward.bestStars === 3
      ? { title: "Mastery marker complete", copy: "This lesson is ready for spaced review. Your three-star marker stays on the trail." }
      : reward.bestStars === 2
      ? { title: "One clean pass from mastery", copy: "A future no-hint review can turn this into a three-star skill." }
      : { title: "The path stays open", copy: "Corrections finished the lesson. Daily Review will bring the useful steps back at the right time." };
    const outcome = reward.firstCompletion
      ? { kicker: "LESSON COMPLETE · NEW", title: "That step is yours.", copy: <><strong>{lesson.title}</strong> is complete. Corrections count.</> }
      : reward.starsImproved
      ? { kicker: "MASTERY UPGRADED", title: "Your marker just leveled up.", copy: <><strong>{lesson.title}</strong> now has a {reward.bestStars}-star best.</> }
      : { kicker: "PRACTICE COMPLETE", title: "Practice strengthened.", copy: <><strong>{lesson.title}</strong> is refreshed. Your {reward.bestStars}-star best stays saved.</> };
    const regionKeyCount = region?.lessons.filter((item) => item.id === lesson.id || completeMap.has(item.id)).length ?? lesson.order;
    const keyStatus = reward.firstCompletion ? "New key" : reward.starsImproved ? "Key safe · marker upgraded" : "Key already safe";
    const primaryHref = reward.firstCompletion
      ? regionFinished ? `/boss/${lesson.regionId}?grade=${lesson.grade}${demo ? "&demo=1" : ""}` : `/learn/${following?.slug}?grade=${lesson.grade}${demo ? "&demo=1" : ""}`
      : trailUrl;
    const primaryLabel = reward.firstCompletion ? regionFinished ? "Enter the unlocked boss" : "Continue to the next lesson" : "Return to your trail";
    const secondaryHref = reward.firstCompletion
      ? trailUrl
      : regionFinished ? `/boss/${lesson.regionId}?grade=${lesson.grade}${demo ? "&demo=1" : ""}` : `/learn/${following?.slug}?grade=${lesson.grade}${demo ? "&demo=1" : ""}`;
    const secondaryLabel = reward.firstCompletion ? "Finish for today" : regionFinished ? "Revisit the boss" : "Practice the next lesson";
    const nextStep = reward.firstCompletion
      ? regionFinished
        ? { kicker: "BOSS GATE OPEN", title: `${region?.title ?? "Region"} Boss`, copy: "Five mixed questions connect all four lesson ideas. No timer, unlimited retries." }
        : { kicker: "NEXT QUEST UNLOCKED", title: following?.title ?? "Return to the trail", copy: "The next short lesson is ready whenever you are. Stopping here is also progress." }
      : { kicker: "TRAIL STATUS", title: "Your progress is protected.", copy: "This practice strengthened memory without removing XP, stars, or quest keys you already earned." };
    const currentAchievementTotals = achievementTotalsForState(state);
    const previousAchievementTotals = {
      ...currentAchievementTotals,
      lessons: Math.max(0, currentAchievementTotals.lessons - (reward.firstCompletion ? 1 : 0)),
      stars: Math.max(0, currentAchievementTotals.stars - Math.max(0, reward.bestStars - reward.previousStars)),
    };
    const unlockedLandmark = achievementUnlockedBetween(previousAchievementTotals, currentAchievementTotals);
    return (
      <main className="learner-shell celebration-page">
        <SuccessBurst eventKey={`${lesson.id}-complete-${stars}-${reward.firstCompletion ? "new" : reward.starsImproved ? "upgrade" : "replay"}`} large />
        {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
        <LearnerHeader state={state} demo={demo} />
        <section className={`celebration-card accent-${lesson.accent}`}>
          <div className="celebration-emblem"><TopicIcon visual={lesson.visual} accent={lesson.accent} size="xl" label={`${lesson.title} completed`} /><span aria-hidden="true">✓</span></div>
          <span className="section-kicker">{outcome.kicker}</span>
          <h1>{outcome.title}</h1>
          <p>{outcome.copy}</p>
          <div className="settlement-summary" aria-label={`Lesson result: ${keyStatus}, ${stars} run stars, ${reward.xpEarned} XP earned`}>
            <span className="settlement-key"><b aria-hidden="true">✓</b><strong>{keyStatus}</strong><small>{regionKeyCount} of 4 collected</small></span>
            <span className="settlement-stars"><b aria-hidden="true">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</b><strong>{masteryMessage}</strong><small>{reward.bestStars}/3 saved best</small></span>
            <span className={`settlement-xp ${reward.xpEarned === 0 ? "quiet" : ""}`}><b>+{reward.xpEarned}</b><strong>XP this run</strong><small>{replayed ? "Fair replay" : "Saved to total"}</small></span>
          </div>
          <div className="quest-key-card" aria-label={`${regionKeyCount} of 4 quest keys collected in ${region?.title ?? "this region"}`}>
            <div className="quest-key-copy"><small>REGION QUEST KEYS</small><strong>{regionKeyCount} / 4 collected</strong><span>{regionKeyCount === 4 ? "Boss gate open" : `${4 - regionKeyCount} ${4 - regionKeyCount === 1 ? "key" : "keys"} until the boss`}</span></div>
            <div className="quest-key-nodes" aria-hidden="true">{region?.lessons.map((item, index) => {
              const collected = item.id === lesson.id || completeMap.has(item.id);
              return <span className={collected ? "collected" : index === regionKeyCount ? "next" : "locked"} key={item.id}>{collected ? "✓" : index + 1}</span>;
            })}<i /><b className={regionKeyCount === 4 ? "open" : ""}>★</b></div>
          </div>
          {unlockedLandmark && <PrivateLandmarkUnlock achievement={unlockedLandmark} demo={demo} />}
          <section className="settlement-next" aria-labelledby="settlement-next-title">
            {reward.firstCompletion && regionFinished ? <span className="settlement-boss-icon" aria-hidden="true">★</span> : <TopicIcon visual={reward.firstCompletion && following ? following.visual : lesson.visual} accent={reward.firstCompletion && following ? following.accent : lesson.accent} size="md" label="" />}
            <div><small>{nextStep.kicker}</small><strong id="settlement-next-title">{nextStep.title}</strong><p>{nextStep.copy}</p></div>
          </section>
          <details className="settlement-details">
            <summary><span><strong>Stars and XP details</strong><small>Stars never block progress · replay XP stays fair</small></span><b aria-hidden="true">⌄</b></summary>
            <div className="settlement-details-body">
              <div className="mastery-next-goal"><span aria-hidden="true">{reward.bestStars === 3 ? "✦" : reward.bestStars === 2 ? "↑" : "↻"}</span><div><small>NEXT MASTERY GOAL</small><strong>{masteryNext.title}</strong><p>{masteryNext.copy}</p></div></div>
              <div className={`reward-receipt ${replayed ? "replay" : reward.starsImproved ? "upgrade" : "new"}`} aria-label={`${reward.xpEarned} XP earned on this run`}>
                <header><div><small>REWARD RECEIPT</small><strong>{replayed ? "Fair replay · skill refreshed" : reward.starsImproved ? "New best · bonus unlocked" : "First finish · XP banked"}</strong></div><b>+{reward.xpEarned} XP</b></header>
                <div className="reward-receipt-path" aria-hidden="true"><span className={reward.baseXp > 0 ? "earned" : "quiet"}><b>{reward.baseXp > 0 ? `+${reward.baseXp}` : "—"}</b><small>First finish</small></span><i /><span className={reward.starXp > 0 ? "earned" : "quiet"}><b>{reward.starXp > 0 ? `+${reward.starXp}` : "—"}</b><small>Star bonus</small></span><i /><span className="total"><b>+{reward.xpEarned}</b><small>This run</small></span></div>
                <p>{replayed ? "Repeat XP stays at 0 so practice cannot be farmed for the weekly league. Your memory work still counts." : reward.starsImproved ? `Your ${reward.bestStars}-star marker and the new bonus are permanently saved.` : "This one-time lesson reward is now included in your XP total."}</p>
              </div>
            </div>
          </details>
          <p className="settlement-save-note"><span aria-hidden="true">✓</span><strong>Everything is saved.</strong> This is enough for today.</p>
          <div className="celebration-actions settlement-actions">
            <a className="primary-button" href={primaryHref}>{primaryLabel} <span aria-hidden="true">→</span></a>
            <a className="secondary-button" href={secondaryHref}>{secondaryLabel}</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="learner-shell lesson-shell">
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <div className="lesson-topline">
        <a href={trailUrl} className="back-link">← Trail</a>
        <div className="lesson-progress" role="progressbar" aria-label={`Lesson progress: ${currentStageLabel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={lessonProgressPercent}><span style={{ width: `${lessonProgressPercent}%` }} /></div>
        <button className="sheet-button" type="button" disabled={!lesson.quickSheet} onClick={() => setSheetOpen(true)}>{lesson.quickSheet ? "Quick Sheet" : "Lesson notes"}</button>
      </div>
      <div className={`lesson-mobile-status accent-${lesson.accent}`} aria-label={`Quest step ${stage + 1} of ${stageLabels.length}: ${currentStageLabel}`}>
        <div className="lesson-mobile-topic"><TopicIcon visual={lesson.visual} accent={lesson.accent} size="sm" label="" /><span><small>QUEST STEP {stage + 1} OF {stageLabels.length}</small><strong>{currentStageLabel}</strong></span></div>
        <div className="lesson-mobile-steps" aria-hidden="true">{stageLabels.map((item, index) => <i className={index < stage ? "done" : index === stage ? "active" : ""} key={item.label}>{index < stage ? "✓" : index + 1}</i>)}</div>
      </div>
      <div className="lesson-layout">
        <aside className="lesson-sidebar">
          <div className="lesson-region-identity"><TopicIcon visual={lesson.visual} accent={lesson.accent} size="md" label={`${lesson.title} topic icon`} /><span className={`lesson-region-badge accent-${lesson.accent}`}>{String(region?.order ?? 1).padStart(2, "0")}</span></div>
          <span className="section-kicker">GRADE {lesson.grade} · REGION {region?.order ?? 1} · LESSON {lesson.order}</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.goal}</p>
          <ol className="stage-list">{stageLabels.map((item, index) => <li className={index < stage ? "done" : index === stage ? "active" : ""} key={item.label}><span aria-hidden="true">{index < stage ? "✓" : item.icon}</span>{item.label}</li>)}</ol>
          <span className="standard-chip">{lesson.standard}</span>
        </aside>

        <section className="lesson-stage" aria-live="polite">
          {stage === 0 && <StageCard kicker="GOAL" title={lesson.goal} copy="Read the goal. Take your time." visual={<div className={`goal-concept accent-${lesson.accent}`}><TopicIcon visual={lesson.visual} accent={lesson.accent} size="xl" label={`${lesson.title} concept`} /><span>Today’s focus</span><strong>{lesson.title}</strong></div>} onContinue={advanceStage} />}
          {stage === 1 && <StageCard kicker="SEE IT" title="Picture it first." copy="Use the diagram. Notice what stays the same." visual={<ConceptVisual lesson={lesson} />} onContinue={advanceStage} />}
          {stage === 2 && <StageCard kicker="KEY IDEA" title={lesson.keyIdea} copy="One sentence to remember." visual={<div className={`key-idea-card accent-${lesson.accent}`}><span>KEY IDEA</span><strong>{lesson.keyIdea}</strong></div>} onContinue={advanceStage} />}
          {stage === 3 && <StageCard kicker="EXAMPLE" title={lesson.example} copy="Follow each step." visual={<ol className="example-steps">{lesson.exampleSteps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>} onContinue={advanceStage} />}
          {stage === 4 && (
            <div className="practice-stage" aria-busy={busy}>
              <div className="practice-heading"><div><span className="section-kicker">PRACTICE · {questionIndex + 1} OF {lesson.practice.length}</span><h2>{question.prompt}</h2></div><div className="practice-dots">{lesson.practice.map((item, index) => <span className={index < questionIndex ? "done" : index === questionIndex ? "active" : ""} key={item.id} />)}</div></div>
              <div className="practice-game-status"><div className={`practice-charge accent-${lesson.accent}`} aria-label={`Focus charge: ${correctedCount} of ${lesson.practice.length} questions corrected`}><div><span>FOCUS CHARGE</span><strong>{focusChargeLabels[correctedCount]}</strong></div><div className="charge-cells" aria-hidden="true">{lesson.practice.map((item, index) => <i className={index < correctedCount ? "done" : index === correctedCount ? "current" : ""} key={item.id}>{index < correctedCount ? "✓" : index + 1}</i>)}</div><small>{correctedCount}/{lesson.practice.length}</small></div><MomentumRun label="FOCUS CHAIN" current={focusStreak} best={bestFocusStreak} total={lesson.practice.length} tone="focus" justLinked={feedback === "correct" && currentFirstTry} /></div>
              <div className={`practice-star-path accent-${lesson.accent}`} aria-live="polite">
                <div className="star-path-heading"><div><span>STAR PATH</span><strong>Corrections always finish the lesson.</strong></div><small>Stars describe this run—they never block progress.</small></div>
                <div className="star-path-options">
                  <span className="live"><b>★</b><strong>Complete all 5</strong><small>{correctedCount}/5 corrected</small></span>
                  <span className={firstTryCount >= 4 ? "earned" : twoStarPathOpen ? "live" : "review"}><b>★★</b><strong>4 first tries</strong><small>{firstTryCount >= 4 ? "secured" : twoStarPathOpen ? `${firstTryCount}/4 so far` : "future review goal"}</small></span>
                  <span className={threeStarPathOpen ? "live" : "review"}><b>★★★</b><strong>Clean, no-hint run</strong><small>{threeStarPathOpen ? "path open" : "future review goal"}</small></span>
                </div>
              </div>
              {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" key={choice} aria-pressed={answer === choice} disabled={answerLocked} onClick={() => { setAnswer(choice); setFeedback(""); setErrorMessage(""); }}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} inputMode={mathInputMode(question.answer)} enterKeyHint="done" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={answerLocked} aria-invalid={feedback === "incorrect"} aria-describedby={errorMessage ? "lesson-answer-error" : feedback ? "lesson-answer-feedback" : undefined} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); setErrorMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") void submitAnswer(); }} placeholder="Type your answer" autoFocus /></label>}
              {showHint && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
              {feedback === "incorrect" && <div id="lesson-answer-feedback" className="feedback-card incorrect recovery-feedback" role="status"><span className="recovery-symbol" aria-hidden="true">↻</span><div><strong>Not yet—try this step.</strong><p>{question.hint}</p><small>No progress lost. Correct it to add the same Focus Charge.</small><div className="recovery-charge-preview" aria-label={`Focus Charge stays safe at ${correctedCount} of ${lesson.practice.length}. Correct this step to reach ${Math.min(correctedCount + 1, lesson.practice.length)} of ${lesson.practice.length}.`}><span><b>{correctedCount}/{lesson.practice.length}</b><small>safe</small></span><i>→</i><span className="current"><b>fix</b><small>this step</small></span><i>→</i><strong><b>{Math.min(correctedCount + 1, lesson.practice.length)}/{lesson.practice.length}</b><small>charged</small></strong></div></div></div>}
              {feedback === "correct" && <><AnswerImpact eventKey={`${lesson.id}-${question.id}-chain-${focusStreak}`} label={currentFirstTry ? "PERFECT HIT" : "RECOVERY HIT"} chain={focusStreak} progress={correctedCount} total={lesson.practice.length} tone={lesson.accent} /><div id="lesson-answer-feedback" className={`feedback-card correct feedback-celebration ${currentFirstTry ? "first-try" : "recovered"}`} role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>{currentFirstTry ? focusStreak >= 3 ? `Focus chain ×${focusStreak}!` : "First-try spark!" : "Recovery complete!"}</strong><p>{practiceEncouragement[questionIndex]} Question {questionIndex + 1} is corrected.</p></div><span className="momentum-chip">{currentFirstTry ? `Chain ×${focusStreak}` : "Recovered +1"}</span></div></>}
              {errorMessage && <p id="lesson-answer-error" className="form-error" role="alert">{errorMessage}</p>}
              <div className="practice-actions"><button className="hint-button" type="button" onClick={useHint} disabled={showHint || busy}>◇ {showHint ? "Hint open" : "Show a hint"}</button>{feedback === "correct" ? <button className="primary-button" type="button" disabled={busy} aria-busy={busy} onClick={continuePractice}>{busy ? "Saving…" : questionIndex === lesson.practice.length - 1 ? "Finish lesson" : "Next question"} <span>→</span></button> : <button className="primary-button" type="button" disabled={!answer.trim() || busy} aria-busy={busy} onClick={submitAnswer}>{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
            </div>
          )}
        </section>
      </div>
      {sheetOpen && lesson.quickSheet && <div className="modal-backdrop"><div className="sheet-modal" role="dialog" aria-modal="true" aria-labelledby="quick-sheet-title" aria-describedby="quick-sheet-help"><button className="modal-close" type="button" onClick={() => setSheetOpen(false)} aria-label="Close quick sheet" autoFocus>×</button><header className="sheet-modal-heading"><span className="section-kicker">QUICK SHEET</span><h2 id="quick-sheet-title">{lesson.title}</h2><p id="quick-sheet-help">Open the full-size sheet to pinch and zoom, or save it for a quick review later.</p></header><a className="sheet-preview-link" href={lesson.quickSheet} target="_blank" rel="noreferrer" aria-label={`Open the full-size ${lesson.title} quick sheet in a new tab`}><Image src={lesson.quickSheet} width={1920} height={1080} alt={`${lesson.title} visual summary with key idea, worked example, and two practice questions`} /><span>Tap to open full size <b aria-hidden="true">↗</b></span></a><div className="sheet-actions"><a className="secondary-button" href={lesson.quickSheet} target="_blank" rel="noreferrer">Open full size <span aria-hidden="true">↗</span></a><a className="primary-button" href={lesson.quickSheet} download>Download PNG <span aria-hidden="true">↓</span></a></div></div></div>}
    </main>
  );
}

function StageCard({ kicker, title, copy, visual, onContinue }: { kicker: string; title: string; copy: string; visual: React.ReactNode; onContinue: () => void }) {
  return <div className="stage-card"><div className="stage-copy"><span className="section-kicker">{kicker}</span><h2>{title}</h2><p>{copy}</p></div><div className="stage-visual">{visual}</div><div className="stage-footer"><span>Take your time. There is no countdown.</span><button className="primary-button" type="button" onClick={onContinue}>I’m ready <span>→</span></button></div></div>;
}

function LessonGate() {
  return <LearningSignInGate glyph="✦" kicker="SAVE YOUR LEARNING" title="Sign in before the lesson." detail="This keeps progress connected to your anonymous trail." />;
}
