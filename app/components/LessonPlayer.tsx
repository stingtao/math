"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { LessonDefinition } from "@/lib/curriculum";
import { getGradeCurriculum, getGradeLessons, getRegion, isAnswerCorrect, nextLesson } from "@/lib/curriculum";
import { applyBadgeProgress, completeDemoLesson, creditDemoCorrectAnswer, type LearnerState } from "@/lib/learner-state";
import { lessonBadgeByLessonId, type BadgeUnlock } from "@/lib/badges";
import { calculateLessonReward } from "@/lib/rewards";
import { ConceptVisual } from "./ConceptVisual";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";
import { achievementTotalsForState, achievementUnlockedBetween } from "@/lib/achievements";
import { PrivateLandmarkUnlock } from "./PrivateLandmarkUnlock";
import { mathInputMode } from "@/lib/math-input";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeUnlockReveal } from "./BadgeUnlockReveal";
import { AnswerImpact } from "./AnswerImpact";
import { BadgeMedallion } from "./BadgeMedallion";
import { WorkedExampleFlow } from "./WorkedExampleFlow";
import { RecoveryCoach } from "./RecoveryCoach";
import { remixedChoices } from "@/lib/practice-recovery";
import { AutoAdvanceButton } from "./AutoAdvanceButton";
import { MemoryReturnCue, TaskProgress } from "./TaskProgress";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [badgeUnlocks, setBadgeUnlocks] = useState<BadgeUnlock[]>([]);
  const [exampleReady, setExampleReady] = useState(false);
  const [recoveryNeeded, setRecoveryNeeded] = useState<Record<string, boolean>>({});
  const [masteryQueue, setMasteryQueue] = useState<string[]>([]);
  const [masteryRounds, setMasteryRounds] = useState<Record<string, number>>({});
  const [masteryTotal, setMasteryTotal] = useState(0);
  const [masteryLockedCount, setMasteryLockedCount] = useState(0);
  const [runId] = useState(() => crypto.randomUUID());
  const inMemoryCheck = masteryQueue.length > 0;
  const masteryQuestionId = masteryQueue[0];
  const question = inMemoryCheck ? lesson.practice.find((item) => item.id === masteryQuestionId) ?? lesson.practice[questionIndex] : lesson.practice[questionIndex];
  const masteryRound = masteryRounds[question.id] ?? 0;
  const attemptKey = inMemoryCheck ? `${question.id}:memory:${masteryRound}` : question.id;
  const choiceOptions = remixedChoices(question.choices, inMemoryCheck);
  const answerLocked = busy || feedback === "correct";
  const correctedCount = inMemoryCheck ? lesson.practice.length : questionIndex + (feedback === "correct" ? 1 : 0);
  const recoveryCount = lesson.practice.filter((item) => recoveryNeeded[item.id]).length;
  const currentFirstTry = feedback === "correct" && Boolean(firstCorrect[attemptKey]) && !hinted[attemptKey];
  const failedAttempts = attempts[attemptKey] ?? 0;
  const questionPosition = Math.max(0, lesson.practice.findIndex((item) => item.id === question.id));
  const nextActionLabel = inMemoryCheck
    ? currentFirstTry
      ? masteryQueue.length === 1 ? "Lock mastery & finish" : "Next Memory Check"
      : "Try once more later"
    : questionIndex === lesson.practice.length - 1
      ? recoveryCount > 0 ? `Start Memory Check (${recoveryCount})` : "Finish lesson"
      : "Next question";
  const region = getRegion(lesson.regionId);
  const completeMap = useMemo(() => new Map(state?.completedLessons.map((item) => [item.id, item.stars]) ?? []), [state]);
  const lessonBadge = lessonBadgeByLessonId.get(lesson.id);

  useEffect(() => {
    if (!sheetOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSheetOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sheetOpen]);

  if (loading) return <LearningLoading glyph="M" tone="blue" kicker="SETTING UP YOUR MISSION" title="Opening the lesson…" detail="Goal, example, and practice are almost ready." />;
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
  const practiceProgress = inMemoryCheck ? .9 + .1 * (masteryLockedCount / Math.max(1, masteryTotal)) : .9 * correctedCount / lesson.practice.length;
  const lessonProgressPercent = Math.round(((stage + (stage === 4 ? practiceProgress : 0)) / stageLabels.length) * 100);
  const currentStageLabel = stage === 4 ? inMemoryCheck ? `Memory Check ${masteryLockedCount + 1} of ${masteryTotal}` : `Practice ${questionIndex + 1} of ${lesson.practice.length}` : stageLabels[stage].label;
  if (!isAvailable) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="locked-lesson"><span className="lock-large">·</span><span className="section-kicker">NEXT REGION LOCKED</span><h1>Clear the current lesson first.</h1><p>Your next route opens as soon as that step is complete.</p><a className="primary-button" href={trailUrl}>Show my next move <span>→</span></a></section></main>;

  function advanceStage() { setStage((value) => Math.min(4, value + 1)); }

  async function submitAnswer() {
    if (!answer.trim() || busy) return;
    setBusy(true);
    setErrorMessage("");
    const priorAttempts = attempts[attemptKey] ?? 0;
    try {
      let correct = isAnswerCorrect(answer, question.answer);
      if (inMemoryCheck && !demo) {
        const response = await fetch("/api/answer", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ lessonId: lesson.id, questionId: question.id, answer, usedHint: Boolean(hinted[attemptKey]), runId, mastery: true, masteryRound }) });
        const body = await response.json() as { correct?: boolean; error?: string };
        if (!response.ok) { setErrorMessage(body.error ?? "We could not check that Memory Check."); return; }
        correct = Boolean(body.correct);
      } else if (demo && correct && !inMemoryCheck) {
        const badgeResult = creditDemoCorrectAnswer(activeState);
        setState(badgeResult.state);
        if (badgeResult.badgeUnlocks.length) setBadgeUnlocks(badgeResult.badgeUnlocks);
      } else if (!demo && !inMemoryCheck) {
        const response = await fetch("/api/answer", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ lessonId: lesson.id, questionId: question.id, answer, usedHint: Boolean(hinted[attemptKey]), runId }) });
        const body = await response.json() as { correct?: boolean; correctAnswers?: number; badgeUnlocks?: BadgeUnlock[]; error?: string };
        if (!response.ok) { setErrorMessage(body.error ?? "We could not check that answer."); return; }
        correct = Boolean(body.correct);
        if (correct && body.correctAnswers !== undefined) setState(applyBadgeProgress(activeState, body.correctAnswers, body.badgeUnlocks));
        if (body.badgeUnlocks?.length) setBadgeUnlocks(body.badgeUnlocks);
      }
      setAttempts((current) => ({ ...current, [attemptKey]: priorAttempts + 1 }));
      if (priorAttempts === 0) setFirstCorrect((current) => ({ ...current, [attemptKey]: correct }));
      if (!correct && !inMemoryCheck) setRecoveryNeeded((current) => ({ ...current, [question.id]: true }));
      const cleanFirstTry = correct && priorAttempts === 0 && !hinted[attemptKey];
      setFocusStreak((current) => cleanFirstTry ? current + 1 : 0);
      setFeedback(correct ? "correct" : "incorrect");
    } catch {
      setErrorMessage("Your answer is still here. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function continuePractice() {
    if (feedback !== "correct") return;
    if (inMemoryCheck && !currentFirstTry) {
      setMasteryQueue((current) => [...current.slice(1), current[0]]);
      setMasteryRounds((current) => ({ ...current, [question.id]: (current[question.id] ?? 0) + 1 }));
      setAnswer("");
      setFeedback("");
      setShowHint(false);
      return;
    }
    if (inMemoryCheck && masteryQueue.length > 1) {
      setMasteryQueue((current) => current.slice(1));
      setMasteryLockedCount((value) => value + 1);
      setAnswer("");
      setFeedback("");
      setShowHint(false);
      return;
    }
    if (!inMemoryCheck && questionIndex < lesson.practice.length - 1) {
      setQuestionIndex((value) => value + 1);
      setAnswer("");
      setFeedback("");
      setShowHint(false);
      return;
    }
    if (!inMemoryCheck) {
      const queue = lesson.practice.filter((item) => recoveryNeeded[item.id]).map((item) => item.id);
      if (queue.length) {
        setMasteryQueue(queue);
        setMasteryTotal(queue.length);
        setMasteryLockedCount(0);
        setAnswer("");
        setFeedback("");
        setShowHint(false);
        return;
      }
    }
    const correctFirst = lesson.practice.filter((item) => firstCorrect[item.id]).length;
    const usedAnyHint = lesson.practice.some((item) => hinted[item.id]);
    const earnedStars = inMemoryCheck ? 2 : correctFirst === lesson.practice.length && !usedAnyHint ? 3 : correctFirst >= 4 ? 2 : 1;
    const previousStars = activeState.completedLessons.find((item) => item.id === lesson.id)?.stars ?? 0;
    const expectedReward = calculateLessonReward(previousStars, earnedStars);
    if (busy) return;
    setBusy(true);
    setErrorMessage("");
    setStars(earnedStars);
    if (inMemoryCheck) setMasteryLockedCount(masteryTotal);
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
    setHinted((current) => ({ ...current, [attemptKey]: true }));
    if (!inMemoryCheck) setRecoveryNeeded((current) => ({ ...current, [question.id]: true }));
  }

  if (finished) {
    const following = nextLesson(lesson);
    const regionFinished = lesson.order === 4;
    const reward = completionReward ?? { previousStars: 0, bestStars: stars, firstCompletion: true, starsImproved: false, baseXp: 40, starXp: stars === 3 ? 10 : stars === 2 ? 5 : 0, xpEarned: 40 + (stars === 3 ? 10 : stars === 2 ? 5 : 0) };
    const outcome = reward.firstCompletion
      ? { kicker: "LESSON COMPLETE", title: `${lesson.title} complete.`, copy: regionFinished ? `${region?.title ?? "Region"} Boss is unlocked.` : `${following?.title ?? "The next lesson"} is unlocked.` }
      : reward.starsImproved
      ? { kicker: "NEW BEST", title: `${lesson.title}: ${reward.bestStars} stars.`, copy: "Your new best is saved." }
      : { kicker: "PRACTICE COMPLETE", title: `${lesson.title} refreshed.`, copy: `Your ${reward.bestStars}-star best stays saved.` };
    const primaryHref = regionFinished ? `/boss/${lesson.regionId}?grade=${lesson.grade}${demo ? "&demo=1" : ""}` : `/learn/${following?.slug}?grade=${lesson.grade}${demo ? "&demo=1" : ""}`;
    const primaryLabel = regionFinished ? "Start the boss" : "Start the next lesson";
    const nextStep = regionFinished
      ? { kicker: reward.firstCompletion ? "BOSS UNLOCKED" : "BOSS", title: `${region?.title ?? "Region"} Boss` }
      : { kicker: reward.firstCompletion ? "NEXT LESSON UNLOCKED" : "NEXT LESSON", title: following?.title ?? "Learning map" };
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
          <div className="completion-earnings" aria-label={`${stars} of 3 stars and ${reward.xpEarned} XP earned`}>
            <span><b aria-hidden="true">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</b><strong>{stars}/3 stars</strong></span>
            <span className={reward.xpEarned === 0 ? "quiet" : ""}><b>+{reward.xpEarned}</b><strong>XP</strong></span>
            {masteryLockedCount > 0 && <span><b aria-hidden="true">↻</b><strong>{masteryLockedCount} recalled</strong></span>}
          </div>
          {unlockedLandmark && <PrivateLandmarkUnlock achievement={unlockedLandmark} demo={demo} compact />}
          <section className="settlement-next" aria-labelledby="settlement-next-title">
            {reward.firstCompletion && regionFinished ? <span className="settlement-boss-icon" aria-hidden="true">★</span> : <TopicIcon visual={reward.firstCompletion && following ? following.visual : lesson.visual} accent={reward.firstCompletion && following ? following.accent : lesson.accent} size="md" label="" />}
            <div><small>{nextStep.kicker}</small><strong id="settlement-next-title">{nextStep.title}</strong></div>
          </section>
          <div className="celebration-actions settlement-actions">
            <a className="primary-button" href={primaryHref}>{primaryLabel} <span aria-hidden="true">→</span></a>
            <a className="text-link" href={trailUrl}>Back to map</a>
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
        <button className="sheet-button" type="button" disabled={!lesson.quickSheet} onClick={() => setSheetOpen(true)}>{lesson.quickSheet ? "Visual recap" : "Lesson notes"}</button>
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
          {lessonBadge && <div className={`lesson-badge-quest accent-${lesson.accent}`} aria-label={`${lessonBadge.title}: ${completeMap.has(lesson.id) ? "earned" : `${lessonProgressPercent} percent complete`}`}>
            <BadgeMedallion badge={lessonBadge} earned={completeMap.has(lesson.id)} size="sm" />
            <div>{!completeMap.has(lesson.id) && <small>NEXT BADGE</small>}<strong>{lessonBadge.title}</strong>{!completeMap.has(lesson.id) && <span role="progressbar" aria-label="Lesson badge progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={lessonProgressPercent}><i style={{ width: `${lessonProgressPercent}%` }} /></span>}</div>
          </div>}
          <span className="standard-chip">{lesson.standard}</span>
        </aside>

        <section className="lesson-stage" aria-live="polite">
          {stage === 0 && <StageCard kicker="YOUR TARGET" title={lesson.goal} visual={<div className={`goal-concept accent-${lesson.accent}`}><TopicIcon visual={lesson.visual} accent={lesson.accent} size="xl" label={`${lesson.title} concept`} /><strong>{lesson.title}</strong></div>} onContinue={advanceStage} continueLabel="Show me" />}
          {stage === 1 && <StageCard kicker="SEE THE MATH" visual={<ConceptVisual lesson={lesson} />} onContinue={advanceStage} continueLabel="Continue" footerText="" />}
          {stage === 2 && <StageCard kicker="KEY IDEA" title={lesson.keyIdea} onContinue={advanceStage} continueLabel="Try an example" footerText="" />}
          {stage === 3 && <StageCard kicker="WORKED EXAMPLE" title={lesson.example} copy="Predict each move, then reveal the reasoning." visual={<WorkedExampleFlow steps={lesson.exampleSteps} accent={lesson.accent} onComplete={() => setExampleReady(true)} />} onContinue={advanceStage} continueDisabled={!exampleReady} continueLabel={exampleReady ? "Start practice" : "Reveal every step"} footerText={exampleReady ? "Example complete. Now use the move yourself." : "Open each step before practice. No timer."} />}
          {stage === 4 && (
            <div className="practice-stage" aria-busy={busy}>
              {inMemoryCheck && <div className={`memory-check-banner accent-${lesson.accent}`}><span aria-hidden="true">◆</span><div><small>MEMORY CHECK · NO RUSH</small><strong>Use the repaired method without help.</strong><p>Choices may move. Follow the math, not the button position. A clean recall locks mastery.</p></div></div>}
              <div className="practice-heading"><div><span className="section-kicker">{inMemoryCheck ? `MEMORY CHECK · ${masteryLockedCount + 1} OF ${masteryTotal}` : `PRACTICE · ${questionIndex + 1} OF ${lesson.practice.length}`}</span><h2>{question.prompt}</h2></div></div>
              <TaskProgress label={inMemoryCheck ? "Memory check progress" : "Practice progress"} completed={inMemoryCheck ? masteryLockedCount : correctedCount} total={inMemoryCheck ? masteryTotal : lesson.practice.length} accent={lesson.accent} detail={feedback === "incorrect" ? "Use the hint, then retry." : !inMemoryCheck && recoveryCount > 0 ? <MemoryReturnCue count={recoveryCount} /> : undefined} />
              {choiceOptions ? <div className="choice-grid">{choiceOptions.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" key={choice} aria-pressed={answer === choice} disabled={answerLocked} onClick={() => { setAnswer(choice); setFeedback(""); setErrorMessage(""); }}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} inputMode={mathInputMode(question.answer)} enterKeyHint="done" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={answerLocked} aria-invalid={feedback === "incorrect"} aria-describedby={errorMessage ? "lesson-answer-error" : feedback ? "lesson-answer-feedback" : undefined} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); setErrorMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") void submitAnswer(); }} placeholder="Type your answer" autoFocus /></label>}
              {showHint && feedback !== "incorrect" && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
              {feedback === "incorrect" && <RecoveryCoach question={question} response={answer} failedAttempts={failedAttempts} memoryCheck={inMemoryCheck} />}
              {feedback === "correct" && <><AnswerImpact eventKey={`${lesson.id}-${attemptKey}-chain-${focusStreak}`} label={inMemoryCheck ? currentFirstTry ? "RECALLED" : "CORRECTED" : currentFirstTry ? "CORRECT" : "CORRECTED"} chain={focusStreak} progress={inMemoryCheck ? masteryLockedCount + (currentFirstTry ? 1 : 0) : correctedCount} total={inMemoryCheck ? masteryTotal : lesson.practice.length} tone={lesson.accent} /><div id="lesson-answer-feedback" className={`feedback-card correct feedback-celebration ${currentFirstTry ? "first-try" : "recovered"}`} role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>{inMemoryCheck ? currentFirstTry ? "Recalled correctly!" : "Correct—recall it once more later." : currentFirstTry ? focusStreak >= 3 ? `${focusStreak} correct in a row!` : "Correct!" : "Corrected!"}</strong><p>{inMemoryCheck ? currentFirstTry ? "You recalled the method on the first try. This idea is now secure for the lesson." : "This correct answer proves the repair worked. It will return after another idea so you can recall it cleanly." : `${practiceEncouragement[questionPosition]} Question ${questionPosition + 1} is corrected.${recoveryNeeded[question.id] ? " It will return in Memory Check." : ""}`}</p></div><span className="momentum-chip">{inMemoryCheck ? currentFirstTry ? "Recall complete" : "One more recall" : currentFirstTry && focusStreak > 1 ? `${focusStreak} in a row` : "Complete"}</span></div></>}
              {errorMessage && <p id="lesson-answer-error" className="form-error" role="alert">{errorMessage}</p>}
              <div className="practice-actions"><button className="hint-button" type="button" onClick={useHint} disabled={showHint || busy}>◇ {showHint ? "Hint open" : inMemoryCheck ? "Use a repair hint" : "Show a hint"}</button>{feedback === "correct" ? <AutoAdvanceButton eventKey={`${lesson.id}-${attemptKey}`} label={nextActionLabel} busy={busy} onAdvance={continuePractice} /> : <button className="primary-button" type="button" disabled={!answer.trim() || busy} aria-busy={busy} onClick={submitAnswer}>{busy ? "Checking…" : inMemoryCheck ? "Check recall" : "Check answer"} <span>→</span></button>}</div>
            </div>
          )}
        </section>
      </div>
      {sheetOpen && lesson.quickSheet && <div className="modal-backdrop"><div className="sheet-modal" role="dialog" aria-modal="true" aria-labelledby="quick-sheet-title" aria-describedby="quick-sheet-help"><button className="modal-close" type="button" onClick={() => setSheetOpen(false)} aria-label="Close quick sheet" autoFocus>×</button><header className="sheet-modal-heading"><span className="section-kicker">QUICK SHEET</span><h2 id="quick-sheet-title">{lesson.title}</h2><p id="quick-sheet-help">Open the full-size sheet to pinch and zoom, or save it for a quick review later.</p></header><a className="sheet-preview-link" href={lesson.quickSheet} target="_blank" rel="noreferrer" aria-label={`Open the full-size ${lesson.title} quick sheet in a new tab`}><Image src={lesson.quickSheet} width={1920} height={1080} alt={`${lesson.title} visual summary with key idea, worked example, and two practice questions`} /><span>Tap to open full size <b aria-hidden="true">↗</b></span></a><div className="sheet-actions"><a className="secondary-button" href={lesson.quickSheet} target="_blank" rel="noreferrer">Open full size <span aria-hidden="true">↗</span></a><a className="primary-button" href={lesson.quickSheet} download>Download PNG <span aria-hidden="true">↓</span></a></div></div></div>}
    </main>
  );
}

function StageCard({ kicker, title, copy, visual, onContinue, continueDisabled = false, continueLabel = "Continue", footerText = "Take your time. No timer." }: { kicker: string; title?: string; copy?: string; visual?: React.ReactNode; onContinue: () => void; continueDisabled?: boolean; continueLabel?: string; footerText?: string }) {
  return <div className={`stage-card ${visual ? "" : "stage-card-compact"}`}><div className="stage-copy"><span className="section-kicker">{kicker}</span>{title && <h2>{title}</h2>}{copy && <p>{copy}</p>}</div>{visual && <div className="stage-visual">{visual}</div>}<div className="stage-footer">{footerText && <span>{footerText}</span>}<button className="primary-button" type="button" disabled={continueDisabled} onClick={onContinue}>{continueLabel} <span>→</span></button></div></div>;
}

function LessonGate() {
  return <LearningSignInGate glyph="✦" kicker="SAVE THIS MISSION" title="Sign in to start the lesson." detail="Your progress returns through an anonymous trail—not a public profile." />;
}
