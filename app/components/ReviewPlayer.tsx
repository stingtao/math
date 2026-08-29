"use client";

import { useEffect, useMemo, useState } from "react";
import { isAnswerCorrect, lessonById, lessons } from "@/lib/curriculum";
import { applyBadgeProgress, creditDemoCorrectAnswer, saveDemoState, type LearnerState } from "@/lib/learner-state";
import type { BadgeUnlock } from "@/lib/badges";
import { nextMomentumRun } from "@/lib/momentum";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { MomentumRun } from "./MomentumRun";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";
import { mathInputMode } from "@/lib/math-input";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeUnlockReveal } from "./BadgeUnlockReveal";
import { AnswerImpact } from "./AnswerImpact";
import { AutoAdvanceButton } from "./AutoAdvanceButton";

type ReviewQuestion = { lessonId: string; lessonTitle: string; questionId: string; prompt: string; answer?: string; hint: string; choices?: string[] };

export function ReviewPlayer({ demo }: { demo: boolean }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Array<{ lessonId: string; questionId: string; answer: string }>>([]);
  const [finished, setFinished] = useState(false);
  const [recallStreak, setRecallStreak] = useState(0);
  const [bestRecallStreak, setBestRecallStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [badgeUnlocks, setBadgeUnlocks] = useState<BadgeUnlock[]>([]);
  const question = questions[index];
  const questionLesson = question ? lessonById.get(question.lessonId) : undefined;
  const reviewAnchorLesson = questions[0] ? lessonById.get(questions[0].lessonId) : undefined;
  const savedNextLesson = state ? lessonById.get(state.nextLessonId) : undefined;
  const suggestedLesson = savedNextLesson && !state?.completedLessons.some((item) => item.id === savedNextLesson.id) ? savedNextLesson : undefined;
  const savedGrade = suggestedLesson?.grade ?? savedNextLesson?.grade ?? 8;
  const trailHref = `/learn?grade=${savedGrade}${demo ? "&demo=1" : ""}`;
  const suggestedHref = suggestedLesson ? `/learn/${suggestedLesson.slug}?grade=${suggestedLesson.grade}${demo ? "&demo=1" : ""}` : trailHref;
  const questionKey = question ? `${question.lessonId}:${question.questionId}` : "";
  const answerLocked = busy || feedback === "correct";
  const recalledCount = index + (feedback === "correct" ? 1 : 0);
  const currentFirstTry = feedback === "correct" && attempts[questionKey] === 1;

  const demoQuestions = useMemo(() => {
    if (!state) return [];
    const sourceLessons = state.completedLessons.map((entry) => lessonById.get(entry.id)).filter(Boolean);
    const pool = (sourceLessons.length ? sourceLessons : [lessons[0]]).flatMap((lesson) => lesson!.practice.slice(0, 2).map((item) => ({ lessonId: lesson!.id, lessonTitle: lesson!.title, questionId: item.id, prompt: item.prompt, answer: item.answer, hint: item.hint, choices: item.choices })));
    return Array.from({ length: Math.min(5, Math.max(3, state.dueReview)) }, (_, i) => pool[i % pool.length]);
  }, [state]);

  useEffect(() => {
    if (!state || ready) return;
    if (demo) { setQuestions(demoQuestions); setReady(true); return; }
    fetch("/api/review").then(async (response) => {
      const body = await response.json() as { questions?: ReviewQuestion[] };
      setQuestions(body.questions ?? []); setReady(true);
    }).catch(() => setReady(true));
  }, [demo, demoQuestions, ready, state]);

  if (loading || !ready) return <LearningLoading glyph="◇" tone="teal" kicker="BUILDING A QUICK RECALL" title="Choosing today’s ideas…" detail="Up to five skills are coming back at the right time." />;
  if (!state || error) return <LearningSignInGate glyph="◇" kicker="PRIVATE RECALL" title="Sign in to open your review." detail="Only you can see which skills are ready to practice again." />;
  const activeState = state;
  if (!questions.length) return (
    <main className="learner-shell">
      <LearnerHeader state={state} demo={demo} />
      <section className="review-empty review-clear-state">
        <div className="review-finish-emblem review-clear-emblem"><TopicIcon visual="steps" accent="teal" size="xl" label="Daily Review queue clear" /><span aria-hidden="true">✓</span></div>
        <span className="section-kicker">REVIEW · ALL CLEAR</span>
        <h1>No skill is due right now.</h1>
        <p>Your review is caught up. That is a complete study win—no extra work needed.</p>
        <div className="session-save-card"><span aria-hidden="true">✓</span><div><small>PROGRESS SAVED</small><strong>You can stop here.</strong><p>When an idea is ready to revisit, up to five quick recalls will appear as Today’s best step.</p></div></div>
        <div className="review-finish-actions">
          <a className="secondary-button" href={trailHref}>View learning map</a>
          {suggestedLesson && <a className="primary-button" href={suggestedHref}>Optional: {suggestedLesson.title} <span>→</span></a>}
        </div>
      </section>
    </main>
  );

  function recordAnswerResult(correct: boolean) {
    const priorAttempts = attempts[questionKey] ?? 0;
    setAttempts((current) => ({ ...current, [questionKey]: priorAttempts + 1 }));
    const nextStreak = nextMomentumRun({ current: recallStreak, best: bestRecallStreak }, correct && priorAttempts === 0);
    setRecallStreak(nextStreak.current);
    setBestRecallStreak(nextStreak.best);
    setFeedback(correct ? "correct" : "incorrect");
  }

  async function check() {
    if (!answer.trim() || busy) return;
    setBusy(true);
    setErrorMessage("");
    try {
      if (demo) {
        const correct = isAnswerCorrect(answer, question.answer ?? "");
        if (correct) {
          const badgeResult = creditDemoCorrectAnswer(activeState);
          setState(badgeResult.state);
          if (badgeResult.badgeUnlocks.length) setBadgeUnlocks(badgeResult.badgeUnlocks);
        }
        recordAnswerResult(correct);
        return;
      }
      const response = await fetch("/api/review", {
        method: "POST",
        headers: mutationHeaders(),
        body: JSON.stringify({ action: "check", lessonId: question.lessonId, questionId: question.questionId, answer }),
      });
      const body = await response.json() as { correct?: boolean; hint?: string; correctAnswers?: number; badgeUnlocks?: BadgeUnlock[]; error?: string };
      if (!response.ok) setErrorMessage(body.error ?? "We could not check that review answer.");
      else {
        if (body.correct && body.correctAnswers !== undefined) setState(applyBadgeProgress(activeState, body.correctAnswers, body.badgeUnlocks));
        if (body.badgeUnlocks?.length) setBadgeUnlocks(body.badgeUnlocks);
        recordAnswerResult(Boolean(body.correct));
      }
    } catch {
      setErrorMessage("Your review answer is still here. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function next() {
    if (busy) return;
    const submitted = [...answers, { lessonId: question.lessonId, questionId: question.questionId, answer }];
    if (index < questions.length - 1) { setAnswers(submitted); setIndex((value) => value + 1); setAnswer(""); setFeedback(""); return; }
    setBusy(true);
    setErrorMessage("");
    try {
      if (demo) {
        const nextState: LearnerState = { ...activeState, dueReview: 0, totalXp: activeState.totalXp + 20, weeklyXp: activeState.weeklyXp + 20 };
        saveDemoState(nextState); setState(nextState);
      } else {
        const response = await fetch("/api/review", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "complete", answers: submitted }) });
        const body = await response.json() as { state?: LearnerState; error?: string };
        if (!response.ok) { setErrorMessage(body.error ?? "We could not finish today’s review."); return; }
        if (body.state) setState(body.state);
      }
      setAnswers(submitted);
      setFinished(true);
    } catch {
      setErrorMessage("Your completed review is still here. Check your connection and save again.");
    } finally {
      setBusy(false);
    }
  }

  if (finished) return (
    <main className="learner-shell">
      <SuccessBurst eventKey="daily-review-complete" large />
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <section className="review-finish">
        {reviewAnchorLesson && <div className="review-finish-emblem"><TopicIcon visual={reviewAnchorLesson.visual} accent={reviewAnchorLesson.accent} size="xl" label="Daily Review completed" /><span aria-hidden="true">✓</span></div>}
        <span className="section-kicker">DAILY REVIEW COMPLETE</span>
        <h1>{questions.length} skills back online.</h1>
        <p>They will return again when another quick recall will help them stick.</p>
        <div className="review-finish-reward"><span><strong>+20</strong> XP</span><span><strong>{questions.length}/{questions.length}</strong> recalled</span><span><strong>1–14</strong> day cycle</span></div>
        <div className="review-memory-path" aria-label="Today complete and future reviews scheduled"><span className="done"><b>✓</b> Today complete</span><i /><span><b>◇</b> Next recall scheduled</span></div>
        <div className="session-save-card"><span aria-hidden="true">✓</span><div><small>SESSION WIN SAVED</small><strong>You can stop here.</strong><p>When another idea is due, it will appear as Today’s best step on your trail.</p></div></div>
        <div className="review-finish-actions"><a className="secondary-button" href={trailHref}>View learning map</a>{suggestedLesson && <a className="primary-button" href={suggestedHref}>Optional: {suggestedLesson.title} <span>→</span></a>}</div>
      </section>
    </main>
  );

  return (
    <main className="learner-shell review-shell">
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <div className={`review-mobile-status accent-${questionLesson?.accent ?? "teal"}`} aria-label={`Daily Review: ${recalledCount} of ${questions.length} memories recharged`}>
        <header><div><small>5-MINUTE RECALL</small><strong>{question.lessonTitle}</strong></div><b>{recalledCount}/{questions.length}</b></header>
        <div className="review-mobile-nodes" style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }} role="progressbar" aria-label="Daily Review completion" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={recalledCount}>{questions.map((item, dot) => {
          const itemLesson = lessonById.get(item.lessonId);
          const status = dot < recalledCount ? "done" : dot === recalledCount ? "current" : "upcoming";
          return <span className={status} key={`${item.lessonId}-${item.questionId}-mobile-${dot}`}>{itemLesson && <TopicIcon visual={itemLesson.visual} accent={itemLesson.accent} size="sm" label="" />}<b aria-hidden="true">{status === "done" ? "✓" : dot + 1}</b></span>;
        })}</div>
        <footer><span>Fix every miss. Progress never resets.</span><strong>{feedback === "correct" && !currentFirstTry ? "Recovered +1" : recallStreak > 0 ? `Chain ×${recallStreak}` : "+20 XP ready"}</strong></footer>
      </div>
      <section className="review-layout">
        <aside><span className="section-kicker">5-MINUTE REVIEW</span><h1>Keep it ready.</h1><p>Skills return after 1, 3, 7, and 14 days.</p><div className="review-schedule"><span className="done">1 day</span><i /><span>3 days</span><i /><span>7 days</span><i /><span>14 days</span></div><div className="review-memory-meter" aria-label={`${recalledCount} of ${questions.length} memories recharged`}><header><div><span>RECALL STATUS</span><strong>{recalledCount === questions.length ? "All skills ready" : "Recall, fix, lock in"}</strong></div><small>{recalledCount}/{questions.length}</small></header><div className="review-memory-nodes" style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }} role="list">{questions.map((item, dot) => {
          const itemLesson = lessonById.get(item.lessonId);
          const status = dot < recalledCount ? "done" : dot === recalledCount ? "current" : "upcoming";
          return <span className={status} role="listitem" aria-label={`${item.lessonTitle}: ${status === "done" ? "recalled" : status === "current" ? "current" : "upcoming"}`} key={`${item.lessonId}-${item.questionId}-${dot}`}>{itemLesson && <TopicIcon visual={itemLesson.visual} accent={itemLesson.accent} size="sm" label="" />}<b aria-hidden="true">{status === "done" ? "✓" : dot + 1}</b></span>;
        })}</div><p>Every corrected memory fills one pulse. Nothing resets.</p></div><MomentumRun label="RECALL CHAIN" current={recallStreak} best={bestRecallStreak} total={questions.length} tone="memory" justLinked={feedback === "correct" && currentFirstTry} /><small>Complete the set: +20 XP.</small></aside>
        <div className="review-card" aria-busy={busy}>
          <header><div className="review-question-heading">{questionLesson && <TopicIcon visual={questionLesson.visual} accent={questionLesson.accent} size="md" label={`${question.lessonTitle} review topic`} />}<div><span className="section-kicker">{question.lessonTitle.toUpperCase()}</span><h2>{question.prompt}</h2></div></div><span>{index + 1}/{questions.length}</span></header>
          {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" aria-pressed={answer === choice} disabled={answerLocked} onClick={() => { setAnswer(choice); setFeedback(""); setErrorMessage(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} inputMode={mathInputMode(question.answer)} enterKeyHint="done" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={answerLocked} aria-invalid={feedback === "incorrect"} aria-describedby={errorMessage ? "review-answer-error" : feedback ? "review-answer-feedback" : undefined} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); setErrorMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") void check(); }} placeholder="Type your answer" autoFocus /></label>}
          {feedback === "incorrect" && <div id="review-answer-feedback" className="feedback-card incorrect recovery-feedback review-recovery" role="status"><span className="recovery-symbol" aria-hidden="true">↻</span><div><strong>Not yet—use the clue and retry.</strong><p>{question.hint}</p><small>A corrected answer earns the same review credit.</small></div></div>}
          {feedback === "correct" && <><AnswerImpact eventKey={`review-${question.lessonId}-${question.questionId}-chain-${recallStreak}`} label={currentFirstTry ? "MEMORY HIT" : "RECALL RESTORED"} chain={recallStreak} progress={recalledCount} total={questions.length} tone={questionLesson?.accent ?? "teal"} /><div id="review-answer-feedback" className={`feedback-card correct feedback-celebration review-feedback ${currentFirstTry ? "first-try" : "recovered"}`} role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>{currentFirstTry ? recallStreak >= 3 ? `Recall chain ×${recallStreak}!` : "Quick recall!" : "Memory recovered!"}</strong><p>{index + 1} of {questions.length} recharged. Keep the rhythm going.</p></div><span className="momentum-chip">{currentFirstTry ? `Chain ×${recallStreak}` : "Pulse +1"}</span></div></>}
          {errorMessage && <p id="review-answer-error" className="form-error" role="alert">{errorMessage}</p>}
          <div className="practice-actions"><span className="review-dots">{questions.map((item, dot) => <i className={dot < index ? "done" : dot === index ? "active" : ""} key={`${item.lessonId}-${dot}`} />)}</span>{feedback === "correct" ? <AutoAdvanceButton eventKey={`review-${question.lessonId}-${question.questionId}-${index}`} label={index === questions.length - 1 ? "Finish review" : "Next question"} busy={busy} busyLabel="Saving review…" onAdvance={next} /> : <button className="primary-button" type="button" onClick={check} disabled={!answer.trim() || busy} aria-busy={busy}>{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
