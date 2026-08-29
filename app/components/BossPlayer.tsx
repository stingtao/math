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
import { mathInputMode } from "@/lib/math-input";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeUnlockReveal } from "./BadgeUnlockReveal";
import { AnswerImpact } from "./AnswerImpact";

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
  const { state, setState, loading, error } = useLearner(demo);
  const questions = useMemo(() => [...region.lessons.map((item) => ({ ...item.practice[0], lesson: item.title })), { ...region.lessons[0].practice[1], lesson: "Mixed check" }], [region]);
  const completed = new Set(state?.completedLessons.map((item) => item.id) ?? []);
  const unlocked = Boolean(state && region.lessons.every((item) => completed.has(item.id)));
  const learnerReady = Boolean(state);
  const [attemptId, setAttemptId] = useState("");
  const [attemptReady, setAttemptReady] = useState(demo);
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
  const connectedLinks = index + (feedback === "correct" ? 1 : 0);
  const gradeCurriculum = getGradeCurriculum(region.grade);
  const regionIndex = gradeCurriculum.regions.findIndex((item) => item.id === region.id);
  const nextRegion = gradeCurriculum.regions[regionIndex + 1];
  const isFinalRegion = !nextRegion;

  useEffect(() => {
    if (!learnerReady || !unlocked) return;
    if (demo) {
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
  }, [demo, questions.length, region.id, learnerReady, unlocked]);

  if (loading || unlocked && !attemptReady) return <LearningLoading glyph="★" tone="gold" kicker="OPENING THE BOSS GATE" title="Preparing the check…" detail="Five mixed challenges and three hearts are being set in place." />;
  if (!state || error) return <LearningSignInGate glyph="★" kicker="PRIVATE BOSS PROGRESS" title="Sign in to open this check." detail="Your attempts and recovery practice stay connected to your anonymous trail." />;
  const activeState = state;
  const trailUrl = `/learn?grade=${region.grade}${demo ? "&demo=1" : ""}`;
  const victoryUrl = isFinalRegion ? `/review?grade=${region.grade}${demo ? "&demo=1" : ""}` : `/learn/${nextRegion.lessons[0].slug}?grade=${region.grade}${demo ? "&demo=1" : ""}`;
  const trailRegionUrl = nextRegion ? `${trailUrl}#region-${nextRegion.id}` : trailUrl;
  if (!unlocked) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="locked-lesson"><span className="lock-large">★</span><span className="section-kicker">BOSS LOCKED</span><h1>Four lessons come first.</h1><p>Finish this region, then return for the mixed check.</p><a className="primary-button" href={trailUrl}>Back to Grade {region.grade} <span>→</span></a></section></main>;

  function applyAttempt(attempt: Partial<BossAttempt>) {
    if (attempt.attemptId) setAttemptId(attempt.attemptId);
    if (typeof attempt.hearts === "number") setHearts(attempt.hearts);
    if (typeof attempt.failed === "boolean") setFailed(attempt.failed);
    if (attempt.failedQuestion !== undefined) setFailedQuestion(attempt.failedQuestion);
    if (typeof attempt.repairStep === "number") setRepair(attempt.repairStep);
  }

  async function check() {
    if (!answer.trim() || busy) return;
    setBusy(true);
    setErrorMessage("");
    setSyncMessage("");
    try {
      if (demo) {
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
    if (demo) finishBoss();
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
    if (!repairAnswer.trim() || busy) return;
    setBusy(true);
    setErrorMessage("");
    try {
      if (demo) {
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
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <section className="boss-victory boss-region-clear" aria-labelledby="boss-clear-title">
        <div className="celebration-emblem boss-emblem"><TopicIcon visual={region.lessons[0].visual} accent={region.accent} size="xl" label={`${region.title} region cleared`} /><span aria-hidden="true">★</span></div>
        <span className="section-kicker">GRADE {region.grade} · REGION {region.order} CLEARED</span>
        <h1 id="boss-clear-title">{isFinalRegion ? `Grade ${region.grade} trail cleared.` : `${region.title} connected.`}</h1>
        <p>{isFinalRegion ? "Every region is complete. Daily Review will keep the whole trail ready to use." : "Four lesson skills and the mixed finish now form one complete region."}</p>

        <div className="boss-victory-map" aria-label={`All four ${region.title} lesson skills connected to the region clear`}>
          <header><span>REGION CONNECTION</span><strong>4 lessons + 1 Boss</strong></header>
          <div className="boss-victory-route" role="list">
            {region.lessons.map((lesson) => <div className="boss-victory-skill" role="listitem" key={lesson.id}><TopicIcon visual={lesson.visual} accent={lesson.accent} size="sm" label="" /><b aria-hidden="true">✓</b><small>{lesson.title}</small></div>)}
            <div className="boss-victory-seal" role="listitem"><span aria-hidden="true">★</span><b aria-hidden="true">✓</b><small>Region clear</small></div>
          </div>
          <p><span aria-hidden="true">◆</span>Every skill remains open to revisit. The clear is permanent.</p>
        </div>

        <div className="boss-settlement-summary" aria-label="Boss result summary">
          <div><span className="boss-result-icon xp" aria-hidden="true">XP</span><p><strong>{bossXpEarned > 0 ? `+${bossXpEarned} XP` : "0 XP"}</strong><small>{bossXpEarned > 0 ? "First-clear reward" : "Fair replay · no farmable XP"}</small></p></div>
          <div><span className="boss-result-icon hearts" aria-hidden="true">♥</span><p><strong>{hearts}/3 hearts</strong><small>{hearts === 3 ? "Steady clear" : "Clear saved · no penalty"}</small></p></div>
          <div><span className="boss-result-icon badge" aria-hidden="true">{String(region.order).padStart(2, "0")}</span><p><strong>Region clear</strong><small>{bossXpEarned > 0 ? "Permanent trail mark" : "Best hearts kept"}</small></p></div>
        </div>

        {unlockedLandmark && <PrivateLandmarkUnlock achievement={unlockedLandmark} demo={demo} />}

        <div className={`boss-next-region ${isFinalRegion ? "grade-complete" : ""}`}>
          <TopicIcon visual={(nextRegion ?? region).lessons[0].visual} accent={nextRegion?.accent ?? region.accent} size="lg" label={isFinalRegion ? "Daily Review ready" : `${nextRegion.title} unlocked`} />
          <div><span>{isFinalRegion ? "WHOLE TRAIL COMPLETE" : "NEXT REGION UNLOCKED"}</span><h2>{isFinalRegion ? "Daily Review is ready." : `Region ${nextRegion.order}: ${nextRegion.title}`}</h2><p>{isFinalRegion ? "Return for up to five calm recall questions whenever the queue is ready." : nextRegion.subtitle}</p></div>
          <strong>{isFinalRegion ? "READY" : "OPEN"}</strong>
        </div>

        <p className="boss-settlement-save"><span aria-hidden="true">✓</span><strong>Everything is saved.</strong> This is enough for today.</p>
        <div className="boss-victory-actions"><a className="secondary-button" href={trailRegionUrl}>{isFinalRegion ? `Back to Grade ${region.grade}` : "Finish for today"}</a><a className="primary-button" href={victoryUrl}>{isFinalRegion ? "Open Daily Review" : `Start ${nextRegion.title}`} <span>→</span></a></div>
      </section>
    </main>
  );

  if (repairRestored) return (
    <main className={`boss-shell accent-${region.accent}`}>
      <SuccessBurst eventKey={`boss-${region.id}-hearts-restored`} large />
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <section className="repair-restored-card" aria-live="polite">
        <div className="repair-restored-emblem">
          <TopicIcon visual={repairLesson.visual} accent={repairLesson.accent} size="xl" label={`${repairLesson.title} repaired`} />
          <span aria-hidden="true">♥</span>
        </div>
        <span className="section-kicker">REPAIR COMPLETE · 2 OF 2</span>
        <h1>All three hearts restored.</h1>
        <p>You corrected the idea. The boss restarts at question 1 with no XP lost.</p>
        <div className="restored-hearts" aria-label="Three hearts restored">♥♥♥</div>
        <div className="repair-restored-path" aria-label="Both repairs complete and three hearts ready">
          <span><b>✓</b> Repair 1</span><i /><span><b>✓</b> Repair 2</span><i /><strong>♥♥♥ Ready</strong>
        </div>
        <button className="primary-button" type="button" onClick={resetAfterRepair}>Retry boss with full hearts <span>→</span></button>
      </section>
    </main>
  );

  if (failed) return (
    <main className={`boss-shell accent-${region.accent}`}>
      {repairCheckpoint && <AnswerImpact eventKey={`boss-repair-${region.id}-1`} label="REPAIR LOCKED" chain={1} progress={1} total={2} tone={repairLesson.accent} />}
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <section className="repair-card" aria-busy={busy}>
        <div className="repair-emblem"><TopicIcon visual={repairLesson.visual} accent={repairLesson.accent} size="lg" label={`${repairLesson.title} repair`} /><span aria-hidden="true">◇</span></div>
        <span className="section-kicker">2-QUESTION REPAIR</span>
        <h1>Fix the idea. Try again.</h1>
        <p>No XP lost. Answer two focused questions to refill all three hearts.</p>
        <div className="repair-progress" role="progressbar" aria-label={`${repair} of 2 repair questions complete`} aria-valuemin={0} aria-valuemax={2} aria-valuenow={repair}><span className={repair > 0 ? "done" : "active"}>{repair > 0 ? "✓" : "1"}</span><i /><span className={repair > 0 ? "active" : "locked"}>2</span><b>Complete both <em>→</em> ♥♥♥</b></div>
        {repairCheckpoint && <div className="repair-checkpoint" role="status"><span aria-hidden="true">✓</span><div><strong>First repair locked in.</strong><p>One more answer restores ♥♥♥.</p></div></div>}
        <div className="repair-question">
          <span>{repair + 1} OF 2 · {repairLesson.title}</span>
          <strong>{repairQuestion.prompt}</strong>
          {repairQuestion.choices ? <div className="choice-grid">{repairQuestion.choices.map((choice) => <button className={repairAnswer === choice ? "selected" : ""} type="button" aria-pressed={repairAnswer === choice} disabled={repairAnswerLocked} onClick={() => { setRepairAnswer(choice); setRepairFeedback(""); setErrorMessage(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={repairAnswer} inputMode={mathInputMode(repairQuestion.answer)} enterKeyHint="done" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={repairAnswerLocked} aria-invalid={repairFeedback === "incorrect"} aria-describedby={errorMessage ? "boss-repair-error" : repairFeedback ? "boss-repair-feedback" : undefined} onChange={(event) => { setRepairAnswer(event.target.value); setRepairFeedback(""); setErrorMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") void checkRepair(); }} placeholder="Type your answer" autoFocus /></label>}
          {repairFeedback === "incorrect" && <div id="boss-repair-feedback" className="repair-answer-feedback" role="status"><span aria-hidden="true">↻</span><div><strong>Not yet—repair this step.</strong><p>{repairQuestion.hint}</p><small>Repair {repair + 1} stays open. No XP or completed repair is lost.</small></div></div>}
        </div>
        {errorMessage && <p id="boss-repair-error" className="form-error" role="alert">{errorMessage}</p>}
        <button className="primary-button" type="button" onClick={checkRepair} disabled={!repairAnswer.trim() || busy} aria-busy={busy}>{busy ? "Checking…" : repair === 1 ? "Restore all hearts" : "Check repair"} <span>→</span></button>
      </section>
    </main>
  );

  return (
    <main className={`boss-shell accent-${region.accent}`}>
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <div className="boss-topbar"><a href={trailUrl}>← Leave</a><div className="boss-rounds">{questions.map((item, round) => <span className={round < index ? "done" : round === index ? "active" : ""} key={`${item.id}-${round}`} />)}</div><div className="boss-hearts" aria-label={`${hearts} hearts remaining`}>{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</div></div>
      <section className="boss-arena">
        <div className="boss-title"><TopicIcon visual={questionLesson.visual} accent={questionLesson.accent} size="lg" label={`${question.lesson} topic`} /><div><span className="section-kicker">GRADE {region.grade} · {index + 1} OF 5</span><h1>{region.title}</h1><p>No timer. Correct each answer to continue.</p></div></div>
        <div className="boss-connection-map" aria-label={`${connectedLinks} of 5 boss connections complete`}>
          <header><div><span>CONNECTION MAP</span><strong>Four lesson skills + one mixed finish</strong></div><small>{connectedLinks}/5 linked</small></header>
          <div className="boss-connection-nodes" role="list">
            {questions.map((item, round) => {
              const linkLesson = region.lessons[Math.min(round, region.lessons.length - 1)];
              const status = round < connectedLinks ? "done" : round === connectedLinks ? "current" : "upcoming";
              return <div className={`${status} ${round === questions.length - 1 ? "mixed" : ""}`} role="listitem" aria-label={`${item.lesson}: ${status === "done" ? "connected" : status === "current" ? "current question" : "upcoming"}`} key={`${item.id}-connection`}><TopicIcon visual={linkLesson.visual} accent={linkLesson.accent} size="sm" label="" /><span aria-hidden="true">{status === "done" ? "✓" : round === questions.length - 1 ? "★" : round + 1}</span><small>{item.lesson}</small></div>;
            })}
          </div>
          <p><span aria-hidden="true">◆</span>{connectedLinks === 5 ? "All five ideas are connected." : `${5 - connectedLinks} ${5 - connectedLinks === 1 ? "connection" : "connections"} left. A correction keeps the map moving.`}</p>
        </div>
        <div className="boss-question-card" aria-busy={busy}>
          <span className="boss-topic">{question.lesson}</span>
          <h2>{question.prompt}</h2>
          {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" aria-pressed={answer === choice} disabled={answerLocked} onClick={() => { setAnswer(choice); setFeedback(""); setErrorMessage(""); setSyncMessage(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} inputMode={mathInputMode(question.answer)} enterKeyHint="done" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={answerLocked} aria-invalid={feedback === "incorrect"} aria-describedby={errorMessage ? "boss-answer-error" : feedback ? "boss-answer-feedback" : syncMessage ? "boss-sync-message" : undefined} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); setErrorMessage(""); setSyncMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") void check(); }} placeholder="Type your answer" autoFocus /></label>}
          {showHint && feedback !== "incorrect" && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
          {feedback === "incorrect" && <div id="boss-answer-feedback" className="feedback-card incorrect recovery-feedback boss-recovery" role="status"><span className="recovery-symbol" aria-hidden="true">↻</span><div><strong>Not yet—repair this connection.</strong><p>{question.hint}</p><small>{hearts > 0 ? `${hearts} ${hearts === 1 ? "heart" : "hearts"} remain. The same question stays open.` : "Two focused repairs will refill every heart."}</small></div></div>}
          {feedback === "correct" && <><AnswerImpact eventKey={`boss-${region.id}-${index}`} label="CONNECTION HIT" chain={index + 1} progress={connectedLinks} total={questions.length} tone={questionLesson.accent} /><div id="boss-answer-feedback" className="feedback-card correct feedback-celebration boss-link-feedback" role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>Connection made.</strong><p>{question.lesson} is linked. {hearts === 3 ? "All three hearts remain." : `${hearts} ${hearts === 1 ? "heart remains" : "hearts remain"}.`}</p></div><span className="momentum-chip">Link +1</span></div></>}
          {syncMessage && <div id="boss-sync-message" className="boss-sync-message" role="status"><span aria-hidden="true">↻</span><div><strong>You are back in the right place.</strong><p>{syncMessage}</p></div></div>}
          {errorMessage && <p id="boss-answer-error" className="form-error" role="alert">{errorMessage}</p>}
          <div className="practice-actions"><button className="hint-button" type="button" onClick={() => setShowHint(true)} disabled={busy || showHint || feedback === "correct"}>◇ {showHint ? "Hint open" : "Show hint"}</button>{feedback === "correct" ? <button className="primary-button" type="button" onClick={next}>{index === 4 ? "Finish boss" : "Next question"} <span>→</span></button> : <button className="primary-button" type="button" onClick={check} disabled={!answer.trim() || busy} aria-busy={busy}>{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
