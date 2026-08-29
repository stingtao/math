"use client";

import { useEffect, useMemo, useState } from "react";
import { isAnswerCorrect, lessonById, lessons } from "@/lib/curriculum";
import { applyBadgeProgress, creditDemoCorrectAnswer, saveDemoState, type LearnerState } from "@/lib/learner-state";
import type { BadgeUnlock } from "@/lib/badges";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeUnlockReveal } from "./BadgeUnlockReveal";
import { AnswerImpact } from "./AnswerImpact";
import { AutoAdvanceButton } from "./AutoAdvanceButton";
import { TaskProgress } from "./TaskProgress";
import { QuestionResponse } from "./QuestionResponse";
import { isResponseComplete, type QuestionInteraction } from "@/lib/question-interactions";
import { EnterActionLink } from "./EnterActionLink";

type ReviewQuestion = { lessonId: string; lessonTitle: string; questionId: string; prompt: string; answer?: string; hint: string; interaction: QuestionInteraction; choices?: string[] };

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
  const responseReady = question ? isResponseComplete(question, answer) : false;
  const recalledCount = index + (feedback === "correct" ? 1 : 0);
  const currentFirstTry = feedback === "correct" && attempts[questionKey] === 1;

  const demoQuestions = useMemo(() => {
    if (!state) return [];
    const sourceLessons = state.completedLessons.map((entry) => lessonById.get(entry.id)).filter(Boolean);
    const pool = (sourceLessons.length ? sourceLessons : [lessons[0]]).flatMap((lesson) => lesson!.practice.slice(0, 2).map((item) => ({ lessonId: lesson!.id, lessonTitle: lesson!.title, questionId: item.id, prompt: item.prompt, answer: item.answer, hint: item.hint, interaction: item.interaction, choices: item.choices })));
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
        <div className="review-finish-actions">
          {suggestedLesson && <a className="primary-button" href={suggestedHref}>Start {suggestedLesson.title} <span>→</span></a>}
          <a className="text-link" href={trailHref}>View learning map</a>
        </div>
      </section>
    </main>
  );

  function recordAnswerResult(correct: boolean) {
    const priorAttempts = attempts[questionKey] ?? 0;
    setAttempts((current) => ({ ...current, [questionKey]: priorAttempts + 1 }));
    setRecallStreak((current) => correct && priorAttempts === 0 ? current + 1 : 0);
    setFeedback(correct ? "correct" : "incorrect");
  }

  async function check() {
    if (!responseReady || busy) return;
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
        <div className="review-finish-reward"><span><strong>+20</strong> XP</span></div>
        <p className="review-stop-note">You can stop here.</p>
        <div className="review-finish-actions">{suggestedLesson && <EnterActionLink className="primary-button" href={suggestedHref}>Start {suggestedLesson.title} <span>→</span></EnterActionLink>}<a className="text-link" href={trailHref}>View learning map</a></div>
      </section>
    </main>
  );

  return (
    <main className="learner-shell review-shell">
      {badgeUnlocks.length > 0 && <BadgeUnlockReveal unlocks={badgeUnlocks} demo={demo} onDismiss={() => setBadgeUnlocks([])} />}
      <LearnerHeader state={state} demo={demo} />
      <div className={`review-mobile-status accent-${questionLesson?.accent ?? "teal"}`}>
        <header><div><small>5-MINUTE REVIEW</small><strong>{question.lessonTitle}</strong></div></header>
        <TaskProgress label="Review progress" completed={recalledCount} total={questions.length} accent={questionLesson?.accent ?? "teal"} />
      </div>
      <section className="review-layout">
        <aside><span className="section-kicker">5-MINUTE REVIEW</span><h1>Keep it ready.</h1><p>Skills return after 1, 3, 7, and 14 days.</p><div className="review-schedule"><span className="done">1 day</span><i /><span>3 days</span><i /><span>7 days</span><i /><span>14 days</span></div><TaskProgress label="Review progress" completed={recalledCount} total={questions.length} accent="teal" /></aside>
        <div className="review-card" aria-busy={busy}>
          <header><div className="review-question-heading">{questionLesson && <TopicIcon visual={questionLesson.visual} accent={questionLesson.accent} size="md" label={`${question.lessonTitle} review topic`} />}<div><span className="section-kicker">{question.lessonTitle.toUpperCase()}</span><h2>{question.prompt}</h2></div></div></header>
          <QuestionResponse question={question} value={answer} disabled={answerLocked} invalid={feedback === "incorrect"} describedBy={errorMessage ? "review-answer-error" : feedback ? "review-answer-feedback" : undefined} onChange={(value) => { setAnswer(value); setFeedback(""); setErrorMessage(""); }} onSubmit={() => void check()} />
          {feedback === "incorrect" && <div id="review-answer-feedback" className="feedback-card incorrect recovery-feedback review-recovery" role="status"><span className="recovery-symbol" aria-hidden="true">↻</span><div><strong>Not yet—use the clue and retry.</strong><p>{question.hint}</p><small>A corrected answer earns the same review credit.</small></div></div>}
          {feedback === "correct" && <><AnswerImpact eventKey={`review-${question.lessonId}-${question.questionId}-chain-${recallStreak}`} label={currentFirstTry ? "RECALLED" : "CORRECTED"} chain={recallStreak} progress={recalledCount} total={questions.length} tone={questionLesson?.accent ?? "teal"} /><div id="review-answer-feedback" className={`feedback-card correct feedback-celebration review-feedback ${currentFirstTry ? "first-try" : "recovered"}`} role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>{currentFirstTry ? recallStreak >= 3 ? `${recallStreak} correct in a row!` : "Recalled correctly!" : "Corrected!"}</strong><p>{index + 1} of {questions.length} complete.</p></div><span className="momentum-chip">{currentFirstTry && recallStreak > 1 ? `${recallStreak} in a row` : "Complete"}</span></div></>}
          {errorMessage && <p id="review-answer-error" className="form-error" role="alert">{errorMessage}</p>}
          <div className="practice-actions review-actions">{feedback === "correct" ? <AutoAdvanceButton eventKey={`review-${question.lessonId}-${question.questionId}-${index}`} label={index === questions.length - 1 ? "Finish review" : "Next question"} busy={busy} busyLabel="Saving review…" onAdvance={next} /> : <button className="primary-button" type="button" onClick={check} disabled={!responseReady || busy} aria-busy={busy} aria-keyshortcuts="Enter">{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
