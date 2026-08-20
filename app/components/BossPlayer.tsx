"use client";

import { useEffect, useMemo, useState } from "react";
import type { RegionDefinition } from "@/lib/curriculum";
import { isAnswerCorrect } from "@/lib/curriculum";
import { saveDemoState, type LearnerState } from "@/lib/learner-state";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { SuccessBurst } from "./SuccessBurst";

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
  const [attemptId, setAttemptId] = useState("");
  const [attemptReady, setAttemptReady] = useState(demo);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [hearts, setHearts] = useState(3);
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
  const [showHint, setShowHint] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedQuestion, setFailedQuestion] = useState<number | null>(null);
  const [repair, setRepair] = useState(0);
  const [repairAnswer, setRepairAnswer] = useState("");
  const [repairFeedback, setRepairFeedback] = useState<"" | "correct" | "incorrect">("");
  const [cleared, setCleared] = useState(false);
  const [serverCleared, setServerCleared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const question = questions[Math.min(index, questions.length - 1)];
  const repairLesson = region.lessons[Math.min(failedQuestion ?? index, region.lessons.length - 1)];
  const repairQuestion = repairLesson.practice[Math.min(repair + 2, repairLesson.practice.length - 1)];

  useEffect(() => {
    if (!state || !unlocked) return;
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
  }, [demo, questions.length, region.id, state, unlocked]);

  if (loading || unlocked && !attemptReady) return <main className="loading-page" role="status"><div className="loading-mark">★</div><p>Preparing the check…</p></main>;
  if (!state || error) return <main className="auth-gate"><div className="auth-card"><span className="auth-orbit">★</span><h1>Sign in to open this check.</h1><a className="primary-button" href="/#join">Continue with Google <span>→</span></a></div></main>;
  const activeState = state;
  const trailUrl = `/learn?grade=${region.grade}${demo ? "&demo=1" : ""}`;
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
    if (demo) {
      if (isAnswerCorrect(answer, question.answer)) setFeedback("correct");
      else {
        const nextHearts = hearts - 1;
        setHearts(nextHearts);
        setFeedback("incorrect");
        setShowHint(true);
        if (nextHearts === 0) { setFailedQuestion(index); setFailed(true); }
      }
      setBusy(false);
      return;
    }
    const response = await fetch("/api/boss", {
      method: "POST",
      headers: mutationHeaders(),
      body: JSON.stringify({ action: "check", regionId: region.id, attemptId, questionIndex: index, answer }),
    });
    const body = await response.json() as Partial<BossAttempt> & { correct?: boolean; state?: LearnerState; error?: string; attempt?: BossAttempt | null };
    if (!response.ok) setErrorMessage(body.error ?? "We could not check that answer.");
    else if (body.attempt) applyAttempt(body.attempt);
    else {
      applyAttempt(body);
      setFeedback(body.correct ? "correct" : "incorrect");
      setShowHint(!body.correct);
      setServerCleared(Boolean(body.cleared));
      if (body.state) setState(body.state);
    }
    setBusy(false);
  }

  function finishBoss() {
    const already = activeState.clearedBosses.some((item) => item.regionId === region.id);
    const next: LearnerState = {
      ...activeState,
      clearedBosses: already ? activeState.clearedBosses.map((item) => item.regionId === region.id ? { ...item, hearts: Math.max(item.hearts, hearts) } : item) : [...activeState.clearedBosses, { regionId: region.id, hearts }],
      totalXp: activeState.totalXp + (already ? 0 : 100),
      weeklyXp: activeState.weeklyXp + (already ? 0 : 100),
    };
    saveDemoState(next);
    setState(next);
  }

  function next() {
    if (feedback !== "correct") return;
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
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
    setShowHint(false);
    setFailed(false);
    setFailedQuestion(null);
    setRepair(0);
    setRepairAnswer("");
    setRepairFeedback("");
  }

  async function checkRepair() {
    if (!repairAnswer.trim() || busy) return;
    setBusy(true);
    setErrorMessage("");
    if (demo) {
      const correct = isAnswerCorrect(repairAnswer, repairQuestion.answer);
      setRepairFeedback(correct ? "correct" : "incorrect");
      if (correct && repair === 0) { setRepair(1); setRepairAnswer(""); setRepairFeedback(""); }
      else if (correct) resetAfterRepair();
      setBusy(false);
      return;
    }
    const response = await fetch("/api/boss", {
      method: "POST",
      headers: mutationHeaders(),
      body: JSON.stringify({ action: "repair", regionId: region.id, attemptId, repairIndex: repair, answer: repairAnswer }),
    });
    const body = await response.json() as Partial<BossAttempt> & { correct?: boolean; repaired?: boolean; error?: string; attempt?: BossAttempt | null };
    if (!response.ok) setErrorMessage(body.error ?? "We could not check that repair answer.");
    else if (body.attempt) applyAttempt(body.attempt);
    else {
      applyAttempt(body);
      setRepairFeedback(body.correct ? "correct" : "incorrect");
      if (body.correct && body.repaired) resetAfterRepair();
      else if (body.correct) { setRepair(1); setRepairAnswer(""); setRepairFeedback(""); }
    }
    setBusy(false);
  }

  if (cleared) return <main className={`boss-shell accent-${region.accent}`}><SuccessBurst eventKey={`boss-${region.id}-complete`} large /><LearnerHeader state={state} demo={demo} /><section className="boss-victory"><div className="boss-medal">★</div><span className="section-kicker">GRADE {region.grade} · REGION {region.order} CLEARED</span><h1>Boss cleared.</h1><p>Five connected questions, complete.</p><div className="earned-stars hearts-result">{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</div><div className="reward-strip"><span><strong>+100</strong> XP</span><span><strong>{hearts}/3</strong> hearts</span><span><strong>1</strong> badge</span></div><a className="primary-button" href={trailUrl}>Back to Grade {region.grade} <span>→</span></a></section></main>;

  if (failed) return <main className="boss-shell"><LearnerHeader state={state} demo={demo} /><section className="repair-card"><span className="repair-icon">◇</span><span className="section-kicker">2-QUESTION REPAIR</span><h1>Fix the idea. Try again.</h1><p>No XP lost. Answer two focused questions to refill all three hearts.</p><div className="repair-question"><span>{repair + 1} OF 2 · {repairLesson.title}</span><strong>{repairQuestion.prompt}</strong>{repairQuestion.choices ? <div className="choice-grid">{repairQuestion.choices.map((choice) => <button className={repairAnswer === choice ? "selected" : ""} type="button" onClick={() => { setRepairAnswer(choice); setRepairFeedback(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={repairAnswer} onChange={(event) => { setRepairAnswer(event.target.value); setRepairFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") void checkRepair(); }} placeholder="Type your answer" autoFocus /></label>}{repairFeedback === "incorrect" && <p>Not yet—{repairQuestion.hint}</p>}{repairFeedback === "correct" && <p>Correct. One repair complete.</p>}</div>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="primary-button" type="button" onClick={checkRepair} disabled={!repairAnswer.trim() || busy}>{busy ? "Checking…" : repair === 1 ? "Repair and retry" : "Check repair"} <span>→</span></button></section></main>;

  return (
    <main className={`boss-shell accent-${region.accent}`}>
      <LearnerHeader state={state} demo={demo} />
      <div className="boss-topbar"><a href={trailUrl}>← Leave</a><div className="boss-rounds">{questions.map((item, round) => <span className={round < index ? "done" : round === index ? "active" : ""} key={`${item.id}-${round}`} />)}</div><div className="boss-hearts" aria-label={`${hearts} hearts remaining`}>{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</div></div>
      <section className="boss-arena">
        <div className="boss-title"><span className="section-kicker">GRADE {region.grade} · {index + 1} OF 5</span><h1>{region.title}</h1><p>No timer. Correct each answer to continue.</p></div>
        <div className="boss-question-card">
          <span className="boss-topic">{question.lesson}</span>
          <h2>{question.prompt}</h2>
          {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" onClick={() => { setAnswer(choice); setFeedback(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") void check(); }} placeholder="Type your answer" autoFocus /></label>}
          {showHint && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
          {feedback === "incorrect" && <div className="feedback-card incorrect"><span>Not yet</span><p>{question.hint}</p></div>}
          {feedback === "correct" && <><SuccessBurst eventKey={`boss-${region.id}-${index}`} /><div className="feedback-card correct"><span>Correct</span><p>Next connection ready.</p></div></>}
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          <div className="practice-actions"><button className="hint-button" type="button" onClick={() => setShowHint(true)}>◇ Show hint</button>{feedback === "correct" ? <button className="primary-button" type="button" onClick={next}>{index === 4 ? "Finish boss" : "Next question"} <span>→</span></button> : <button className="primary-button" type="button" onClick={check} disabled={!answer.trim() || busy}>{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
