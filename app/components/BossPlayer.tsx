"use client";

import { useEffect, useMemo, useState } from "react";
import type { RegionDefinition } from "@/lib/curriculum";
import { getGradeCurriculum, isAnswerCorrect } from "@/lib/curriculum";
import { applyBadgeProgress, creditDemoCorrectAnswer, saveDemoState, type LearnerState } from "@/lib/learner-state";
import type { BadgeUnlock } from "@/lib/badges";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";
import { achievementTotalsForState, achievementUnlockedBetween, type AchievementSpec } from "@/lib/achievements";
import { PrivateLandmarkUnlock } from "./PrivateLandmarkUnlock";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeUnlockReveal } from "./BadgeUnlockReveal";
import { AnswerImpact } from "./AnswerImpact";
import { AutoAdvanceButton } from "./AutoAdvanceButton";
import { QuestionResponse } from "./QuestionResponse";
import { EnterActionLink } from "./EnterActionLink";
import { XpProgress } from "./XpProgress";
import { isResponseComplete } from "@/lib/question-interactions";
import { EnterActionButton } from "./EnterActionButton";

type BossAttempt = {
  attemptId: string;
  questionIndex: number;
  hearts: number;
  failed: boolean;
  failedQuestion: number | null;
  repairStep: number;
  cleared: boolean;
};

export function BossPlayer({ region, demo }: { region: RegionDefinition; demo: boolean }) {
  const { state, setState, loading, error, isDemo } = useLearner(demo);
  const questions = useMemo(() => [...region.lessons.map((item) => ({ ...item.practice[0], lesson: item.title })), { ...region.lessons[0].practice[1], lesson: "Mixed check" }], [region]);
  const completed = new Set(state?.completedLessons.map((item) => item.id) ?? []);
  const unlocked = Boolean(state && region.lessons.every((item) => completed.has(item.id)));
  const learnerReady = Boolean(state);
  const [attemptId, setAttemptId] = useState("");
  const [attemptReady, setAttemptReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [nextQuestionIndex, setNextQuestionIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [hearts, setHearts] = useState(3);
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
  const [showHint, setShowHint] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedQuestion, setFailedQuestion] = useState<number | null>(null);
  const [repair, setRepair] = useState(0);
  const [repairAnswer, setRepairAnswer] = useState("");
  const [repairFeedback, setRepairFeedback] = useState<"" | "correct" | "incorrect">("");
  const [repairCheckpoint, setRepairCheckpoint] = useState(false);
  const [repairRestored, setRepairRestored] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [serverCleared, setServerCleared] = useState(false);
  const [bossXpEarned, setBossXpEarned] = useState(0);
  const [unlockedLandmark, setUnlockedLandmark] = useState<AchievementSpec | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [badgeUnlocks, setBadgeUnlocks] = useState<BadgeUnlock[]>([]);
  const question = questions[Math.min(index, questions.length - 1)];
  const questionLesson = region.lessons[Math.min(index, region.lessons.length - 1)];
  const repairLesson = region.lessons[Math.min(failedQuestion ?? index, region.lessons.length - 1)];
  const repairQuestion = repairLesson.practice[Math.min(repair + 2, repairLesson.practice.length - 1)];
  const answerLocked = busy || feedback === "correct";
  const repairAnswerLocked = busy || repairFeedback === "correct";
  const responseReady = isResponseComplete(question, answer);
  const repairResponseReady = isResponseComplete(repairQuestion, repairAnswer);
  const connectedLinks = index + (feedback === "correct" ? 1 : 0);
  const gradeCurriculum = getGradeCurriculum(region.grade);
  const regionIndex = gradeCurriculum.regions.findIndex((item) => item.id === region.id);
  const nextRegion = gradeCurriculum.regions[regionIndex + 1];
  const isFinalRegion = !nextRegion;

  useEffect(() => {
    if (!learnerReady || !unlocked) return;
    if (isDemo) {
      setAttemptId((value) => value || crypto.randomUUID());
      setAttemptReady(true);
      return;
    }
    let active = true;
    fetch(`/api/boss?regionId=${region.id}`, { cache: "no-store" }).then(async (response) => {
      const body = await response.json() as { attempt?: BossAttempt | null; error?: string };
      if (!active) return;
      if (!response.ok) {
        setErrorMessage(body.error ?? "We could not open this boss attempt.");
        setAttemptReady(true);
        return;
      }
      const attempt = body.attempt;
      if (attempt) {
        setAttemptId(attempt.attemptId);
        setIndex(Math.min(attempt.questionIndex, questions.length - 1));
        setHearts(attempt.hearts);
        setFailed(attempt.failed);
        setFailedQuestion(attempt.failedQuestion);
        setRepair(attempt.repairStep);
      } else setAttemptId(crypto.randomUUID());
      setAttemptReady(true);
    }).catch(() => {
      if (active) { setErrorMessage("We could not open this boss attempt."); setAttemptReady(true); }
    });
    return () => { active = false; };
  }, [isDemo, questions.length, region.id, learnerReady, unlocked]);

  if (loading || unlocked && !attemptReady) return <LearningLoading glyph="★" tone="gold" kicker="OPENING THE BOSS GATE" title="Preparing the check…" detail={`${questions.length} mixed challenges and three hearts are being set in place.`} />;
  if (!state || error) return <LearningSignInGate glyph="★" kicker="PRIVATE BOSS PROGRESS" title="Sign in to open this check." detail="Your attempts and recovery practice stay connected to your anonymous trail." />;
  const activeState = state;
  const trailUrl = `/learn?grade=${region.grade}${isDemo ? "&demo=1" : ""}`;
  const victoryUrl = isFinalRegion ? `/review?grade=${region.grade}${isDemo ? "&demo=1" : ""}` : `/learn/${nextRegion.lessons[0].slug}?grade=${region.grade}${isDemo ? "&demo=1" : ""}`;
  const trailRegionUrl = nextRegion ? `${trailUrl}#region-${nextRegion.id}` : trailUrl;
  if (!unlocked) return <main className="learner-shell"><LearnerHeader state={state} demo={isDemo} /><section className="locked-lesson"><span className="lock-large">★</span><span className="section-kicker">BOSS LOCKED</span><h1>Clear all {region.lessons.length} lessons first.</h1><p>The {questions.length}-question challenge opens after the last lesson.</p><a className="primary-button" href={trailUrl}>Show my next lesson <span>→</span></a></section></main>;

  function applyAttempt(attempt: Partial<BossAttempt>) {
    if (attempt.attemptId) setAttemptId(attempt.attemptId);
    if (typeof attempt.hearts === "number") setHearts(attempt.hearts);
    if (typeof attempt.failed === "boolean") setFailed(attempt.failed);
    if (attempt.failedQuestion !== undefined) setFailedQuestion(attempt.failedQuestion);
    if (typeof attempt.repairStep === "number") setRepair(attempt.repairStep);
  }

  async function check() {
    if (!responseReady || busy) return;
    setBusy(true);
    setErrorMessage("");
    setSyncMessage("");
    try {
      if (isDemo) {
        if (isAnswerCorrect(answer, question.answer)) {
          const badgeResult = creditDemoCorrectAnswer(activeState);
          setState(badgeResult.state);
          if (badgeResult.badgeUnlocks.length) setBadgeUnlocks(badgeResult.badgeUnlocks);
          setFeedback("correct");
          setNextQuestionIndex(Math.min(index + 1, questions.length - 1));
        }
        else {
          const nextHearts = hearts - 1;
          setHearts(nextHearts);
          setFeedback("incorrect");
          setShowHint(true);
          if (nextHearts === 0) { setFailedQuestion(index); setFailed(true); }
        }
        return;
      }
      const response = await fetch("/api/boss", {
        method: "POST",
        headers: mutationHeaders(),
        body: JSON.stringify({ action: "check", regionId: region.id, attemptId, questionIndex: index, answer }),
      });
      const body = await response.json() as Partial<BossAttempt> & { correct?: boolean; resynced?: boolean; xpEarned?: number; correctAnswers?: number; badgeUnlocks?: BadgeUnlock[]; state?: LearnerState; error?: string; attempt?: BossAttempt | null };
      if (!response.ok) setErrorMessage(body.error ?? "We could not check that answer.");
      else if (body.attempt) applyAttempt(body.attempt);
      else if (body.resynced) {
        applyAttempt(body);
        setAnswer("");
        setFeedback("");
        setShowHint(false);
        setNextQuestionIndex(null);
        setServerCleared(Boolean(body.cleared));
        if (body.state) {
          if (body.cleared && !activeState.clearedBosses.some((item) => item.regionId === region.id)) {
            setBossXpEarned(100);
            const landmark = achievementUnlockedBetween(achievementTotalsForState(activeState), achievementTotalsForState(body.state));
            setUnlockedLandmark(landmark?.source === "bosses" ? landmark : null);
          }
          setState(body.state);
        }
        if (body.cleared) setCleared(true);
        else if (typeof body.questionIndex === "number") {
          const restoredIndex = Math.min(body.questionIndex, questions.length - 1);
          setIndex(restoredIndex);
          setSyncMessage(`Progress restored. Continue with question ${restoredIndex + 1}. No heart was lost.`);
        }
      }
      else {
        applyAttempt(body);
        setFeedback(body.correct ? "correct" : "incorrect");
        setShowHint(!body.correct);
        setNextQuestionIndex(body.correct && typeof body.questionIndex === "number" ? Math.min(body.questionIndex, questions.length - 1) : null);
        setServerCleared(Boolean(body.cleared));
        if (body.cleared) setBossXpEarned(body.xpEarned ?? 0);
        if (body.badgeUnlocks?.length) setBadgeUnlocks(body.badgeUnlocks);
        if (body.state) {
          if (body.cleared) {
            const landmark = achievementUnlockedBetween(achievementTotalsForState(activeState), achievementTotalsForState(body.state));
            setUnlockedLandmark(landmark?.source === "bosses" ? landmark : null);
          }
          setState(body.state);
        } else if (body.correct && body.correctAnswers !== undefined) setState(applyBadgeProgress(activeState, body.correctAnswers, body.badgeUnlocks));
      }
    } catch {
      setErrorMessage("Your answer is still here. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function finishBoss() {
    const already = activeState.clearedBosses.some((item) => item.regionId === region.id);
    setBossXpEarned(already ? 0 : 100);
    const next: LearnerState = {
      ...activeState,
      clearedBosses: already ? activeState.clearedBosses.map((item) => item.regionId === region.id ? { ...item, hearts: Math.max(item.hearts, hearts) } : item) : [...activeState.clearedBosses, { regionId: region.id, hearts }],
      learningHistory: already
        ? activeState.learningHistory.map((item) => item.key === `boss:${region.id}` ? { ...item, hearts: Math.max(item.hearts ?? 0, hearts) } : item)
        : [{ key: `boss:${region.id}`, kind: "boss", regionId: region.id, title: `${region.title} Boss`, grade: region.grade, regionTitle: region.title, completedAt: new Date().toISOString(), hearts }, ...activeState.learningHistory],
      totalXp: activeState.totalXp + (already ? 0 : 100),
      weeklyXp: activeState.weeklyXp + (already ? 0 : 100),
    };
    const landmark = achievementUnlockedBetween(achievementTotalsForState(activeState), achievementTotalsForState(next));
    setUnlockedLandmark(landmark?.source === "bosses" ? landmark : null);
    saveDemoState(next);
    setState(next);
  }

  function next() {
    if (feedback !== "correct") return;
    if (index < questions.length - 1) {
      setIndex(nextQuestionIndex ?? Math.min(index + 1, questions.length - 1));
      setNextQuestionIndex(null);
      setAnswer("");
      setFeedback("");
      setShowHint(false);
      return;
    }
    if (isDemo) finishBoss();
    else if (!serverCleared) { setErrorMessage("The server has not cleared this boss yet."); return; }
    setCleared(true);
  }

  function resetAfterRepair() {
    setIndex(0);
    setAnswer("");
    setHearts(3);
    setFeedback("");
    setNextQuestionIndex(null);
    setShowHint(false);
    setFailed(false);
    setFailedQuestion(null);
    setRepair(0);
    setRepairAnswer("");
    setRepairFeedback("");
    setRepairCheckpoint(false);
    setRepairRestored(false);
  }

  async function checkRepair() {
    if (!repairResponseReady || busy) return;
    setBusy(true);
    setErrorMessage("");
    try {
      if (isDemo) {
        const correct = isAnswerCorrect(repairAnswer, repairQuestion.answer);
        if (correct) {
          const badgeResult = creditDemoCorrectAnswer(activeState);
          setState(badgeResult.state);
          if (badgeResult.badgeUnlocks.length) setBadgeUnlocks(badgeResult.badgeUnlocks);
        }
        setRepairFeedback(correct ? "correct" : "incorrect");
        if (correct && repair === 0) {
          setRepair(1);
          setRepairAnswer("");
          setRepairFeedback("");
          setRepairCheckpoint(true);
        } else if (correct) {
          setHearts(3);
          setFailed(false);
          setRepairRestored(true);
        }
        return;
      }
      const response = await fetch("/api/boss", {
        method: "POST",
        headers: mutationHeaders(),
        body: JSON.stringify({ action: "repair", regionId: region.id, attemptId, repairIndex: repair, answer: repairAnswer }),
      });
      const body = await response.json() as Partial<BossAttempt> & { correct?: boolean; repaired?: boolean; correctAnswers?: number; badgeUnlocks?: BadgeUnlock[]; error?: string; attempt?: BossAttempt | null };
      if (!response.ok) setErrorMessage(body.error ?? "We could not check that repair answer.");
      else if (body.attempt) {
        applyAttempt(body.attempt);
        if (body.attempt.failed && body.attempt.repairStep === 1) setRepairCheckpoint(true);
        if (!body.attempt.failed && body.attempt.hearts === 3 && repair === 1) setRepairRestored(true);
      }
      else {
        applyAttempt(body);
        if (body.badgeUnlocks?.length) setBadgeUnlocks(body.badgeUnlocks);
        if (body.correct && body.correctAnswers !== undefined) setState(applyBadgeProgress(activeState, body.correctAnswers, body.badgeUnlocks));
        setRepairFeedback(body.correct ? "correct" : "incorrect");
        if (body.correct && body.repaired) setRepairRestored(true);
        else if (body.correct) {
          setRepair(1);
          setRepairAnswer("");
          setRepairFeedback("");
          setRepairCheckpoint(true);
        }
      }
    } catch {
      setErrorMessage("Your repair answer is still here. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (cleared) return (
    <main className={`boss-shell accent-${region.accent}`}>
      <SuccessBurst eventKey={`boss-${region.id}-complete`} large />
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={isDemo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={isDemo} />
      <section className="boss-victory boss-region-clear" aria-labelledby="boss-clear-title">
        <div className="celebration-emblem boss-emblem"><TopicIcon visual={region.lessons[0].visual} accent={region.accent} size="xl" label={`${region.title} region cleared`} /><span aria-hidden="true">★</span></div>
        <span className="section-kicker">REGION COMPLETE</span>
        <h1 id="boss-clear-title">{isFinalRegion ? `Grade ${region.grade} complete.` : `${region.title} complete.`}</h1>
        <p>{isFinalRegion ? "Daily Review is ready." : `${nextRegion.title} is unlocked.`}</p>

        <div className="completion-earnings" aria-label={`${hearts} of 3 hearts and ${bossXpEarned} XP earned`}>
          <span><b aria-hidden="true">{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</b><strong>{hearts}/3 hearts</strong></span>
          <span className={bossXpEarned === 0 ? "quiet" : ""}><b>+{bossXpEarned}</b><strong>XP</strong></span>
        </div>
        <XpProgress totalXp={state.totalXp} previousXp={state.totalXp - bossXpEarned} theme={state.profile.theme} variant="reward" />

        {unlockedLandmark && <PrivateLandmarkUnlock achievement={unlockedLandmark} demo={isDemo} compact />}

        <section className={`settlement-next ${isFinalRegion ? "grade-complete" : ""}`} aria-labelledby="boss-next-title">
          <TopicIcon visual={(nextRegion ?? region).lessons[0].visual} accent={nextRegion?.accent ?? region.accent} size="md" label="" />
          <div><small>{isFinalRegion ? "NEXT" : "NEXT REGION UNLOCKED"}</small><strong id="boss-next-title">{isFinalRegion ? "Daily Review" : `Region ${nextRegion.order}: ${nextRegion.title}`}</strong></div>
        </section>

        <div className="boss-victory-actions"><EnterActionLink className="primary-button" href={victoryUrl}>{isFinalRegion ? "Open Daily Review" : `Start ${nextRegion.title}`} <span>→</span></EnterActionLink><a className="text-link" href={trailRegionUrl}>{isFinalRegion ? `Back to Grade ${region.grade}` : "Back to map"}</a></div>
      </section>
    </main>
  );

  if (repairRestored) return (
    <main className={`boss-shell accent-${region.accent}`}>
      <SuccessBurst eventKey={`boss-${region.id}-hearts-restored`} large />
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={isDemo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={isDemo} />
      <section className="repair-restored-card" aria-live="polite">
        <div className="repair-restored-emblem">
          <TopicIcon visual={repairLesson.visual} accent={repairLesson.accent} size="xl" label={`${repairLesson.title} repaired`} />
          <span aria-hidden="true">♥</span>
        </div>
        <span className="section-kicker">REPAIR COMPLETE · 2 OF 2</span>
        <h1>Hearts full. Method repaired.</h1>
        <p>You fixed the skill. Restart at question 1 with no XP lost.</p>
        <div className="restored-hearts" aria-label="Three hearts restored">♥♥♥</div>
        <div className="repair-restored-path" aria-label="Both repairs complete and three hearts ready">
          <span><b>✓</b> Repair 1</span><i /><span><b>✓</b> Repair 2</span><i /><strong>♥♥♥ Ready</strong>
        </div>
        <EnterActionButton className="primary-button" onClick={resetAfterRepair}>Retry boss with full hearts <span>→</span></EnterActionButton>
      </section>
    </main>
  );

  if (failed) return (
    <main className={`boss-shell accent-${region.accent}`}>
      {repairCheckpoint && <AnswerImpact eventKey={`boss-repair-${region.id}-1`} label="REPAIR LOCKED" chain={1} progress={1} total={2} tone={repairLesson.accent} />}
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={isDemo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={isDemo} />
      <section className="repair-card" aria-busy={busy}>
        <div className="repair-emblem"><TopicIcon visual={repairLesson.visual} accent={repairLesson.accent} size="lg" label={`${repairLesson.title} repair`} /><span aria-hidden="true">◇</span></div>
        <span className="section-kicker">2-QUESTION REPAIR</span>
        <h1>Repair the skill. Refill your hearts.</h1>
        <p>Answer two focused questions. Your XP and cleared work stay safe.</p>
        <div className="repair-progress" role="progressbar" aria-label={`${repair} of 2 repair questions complete`} aria-valuemin={0} aria-valuemax={2} aria-valuenow={repair}><span className={repair > 0 ? "done" : "active"}>{repair > 0 ? "✓" : "1"}</span><i /><span className={repair > 0 ? "active" : "locked"}>2</span><b>Complete both <em>→</em> ♥♥♥</b></div>
        {repairCheckpoint && <div className="repair-checkpoint" role="status"><span aria-hidden="true">✓</span><div><strong>First repair locked in.</strong><p>One more answer restores ♥♥♥.</p></div></div>}
        <div className="repair-question">
          <span>{repair + 1} OF 2 · {repairLesson.title}</span>
          <strong>{repairQuestion.prompt}</strong>
          <QuestionResponse question={repairQuestion} value={repairAnswer} disabled={repairAnswerLocked} invalid={repairFeedback === "incorrect"} describedBy={errorMessage ? "boss-repair-error" : repairFeedback ? "boss-repair-feedback" : undefined} onChange={(value) => { setRepairAnswer(value); setRepairFeedback(""); setErrorMessage(""); }} onSubmit={() => void checkRepair()} />
          {repairFeedback === "incorrect" && <div id="boss-repair-feedback" className="repair-answer-feedback" role="status"><span aria-hidden="true">↻</span><div><strong>Not yet—repair this step.</strong><p>{repairQuestion.hint}</p><small>Repair {repair + 1} stays open. No XP or completed repair is lost.</small></div></div>}
        </div>
        {errorMessage && <p id="boss-repair-error" className="form-error" role="alert">{errorMessage}</p>}
        <button className="primary-button" type="button" onClick={checkRepair} disabled={!repairResponseReady || busy} aria-busy={busy} aria-keyshortcuts="Enter">{busy ? "Checking…" : repair === 1 ? "Restore all hearts" : "Check repair"} <span>→</span></button>
      </section>
    </main>
  );

  return (
    <main className={`boss-shell accent-${region.accent}`}>
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={isDemo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={isDemo} />
      <div className="boss-topbar"><a href={trailUrl}>← Leave</a><div className="boss-rounds">{questions.map((item, round) => <span className={round < index ? "done" : round === index ? "active" : ""} key={`${item.id}-${round}`} />)}</div><div className="boss-hearts" aria-label={`${hearts} hearts remaining`}>{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</div></div>
      <section className="boss-arena">
        <div className="boss-title"><TopicIcon visual={questionLesson.visual} accent={questionLesson.accent} size="lg" label={`${question.lesson} topic`} /><div><span className="section-kicker">GRADE {region.grade} · {index + 1} OF {questions.length}</span><h1>{region.title}</h1><p>{questions.length} links. No timer. Every miss can be repaired.</p></div></div>
        <div className="boss-connection-map" aria-label={`${connectedLinks} of ${questions.length} boss connections complete`}>
          <header><div><span>SKILL MAP</span><strong>{region.lessons.length} lesson moves + one mixed finish</strong></div><small>{connectedLinks}/{questions.length} linked</small></header>
          <div className="boss-connection-nodes" role="list">
            {questions.map((item, round) => {
              const linkLesson = region.lessons[Math.min(round, region.lessons.length - 1)];
              const status = round < connectedLinks ? "done" : round === connectedLinks ? "current" : "upcoming";
              return <div className={`${status} ${round === questions.length - 1 ? "mixed" : ""}`} role="listitem" aria-label={`${item.lesson}: ${status === "done" ? "connected" : status === "current" ? "current question" : "upcoming"}`} key={`${item.id}-connection`}><TopicIcon visual={linkLesson.visual} accent={linkLesson.accent} size="sm" label="" /><span aria-hidden="true">{status === "done" ? "✓" : round === questions.length - 1 ? "★" : round + 1}</span><small>{item.lesson}</small></div>;
            })}
          </div>
          <p><span aria-hidden="true">◆</span>{connectedLinks === questions.length ? `All ${questions.length} ideas are connected.` : `${questions.length - connectedLinks} ${questions.length - connectedLinks === 1 ? "connection" : "connections"} left. A correction keeps the map moving.`}</p>
        </div>
        <div className="boss-question-card" aria-busy={busy}>
          <span className="boss-topic">{question.lesson}</span>
          <h2>{question.prompt}</h2>
          <QuestionResponse question={question} value={answer} disabled={answerLocked} invalid={feedback === "incorrect"} describedBy={errorMessage ? "boss-answer-error" : feedback ? "boss-answer-feedback" : syncMessage ? "boss-sync-message" : undefined} onChange={(value) => { setAnswer(value); setFeedback(""); setErrorMessage(""); setSyncMessage(""); }} onSubmit={() => void check()} />
          {showHint && feedback !== "incorrect" && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
          {feedback === "incorrect" && <div id="boss-answer-feedback" className="feedback-card incorrect recovery-feedback boss-recovery" role="status"><span className="recovery-symbol" aria-hidden="true">↻</span><div><strong>Not yet—fix this move.</strong><p>{question.hint}</p><small>{hearts > 0 ? `${hearts} ${hearts === 1 ? "heart" : "hearts"} remain. Retry this same question.` : "Two focused repairs refill every heart."}</small></div></div>}
          {feedback === "correct" && <><AnswerImpact eventKey={`boss-${region.id}-${index}`} label="CONNECTION HIT" chain={index + 1} progress={connectedLinks} total={questions.length} tone={questionLesson.accent} /><div id="boss-answer-feedback" className="feedback-card correct feedback-celebration boss-link-feedback" role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>Connection made.</strong><p>{question.lesson} is linked. {hearts === 3 ? "All three hearts remain." : `${hearts} ${hearts === 1 ? "heart remains" : "hearts remain"}.`}</p></div><span className="momentum-chip">Link +1</span></div></>}
          {syncMessage && <div id="boss-sync-message" className="boss-sync-message" role="status"><span aria-hidden="true">↻</span><div><strong>You are back in the right place.</strong><p>{syncMessage}</p></div></div>}
          {errorMessage && <p id="boss-answer-error" className="form-error" role="alert">{errorMessage}</p>}
          <div className="practice-actions"><button className="hint-button" type="button" onClick={() => setShowHint(true)} disabled={busy || showHint || feedback === "correct"}>◇ {showHint ? "Hint open" : "Show hint"}</button>{feedback === "correct" ? <AutoAdvanceButton eventKey={`boss-${region.id}-${index}`} label={index === questions.length - 1 ? "Finish boss" : "Next question"} busy={busy} busyLabel="Saving boss…" onAdvance={next} /> : <button className="primary-button" type="button" onClick={check} disabled={!responseReady || busy} aria-busy={busy} aria-keyshortcuts="Enter">{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
