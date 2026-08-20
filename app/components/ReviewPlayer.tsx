"use client";

import { useEffect, useMemo, useState } from "react";
import { isAnswerCorrect, lessonById, lessons } from "@/lib/curriculum";
import { saveDemoState, type LearnerState } from "@/lib/learner-state";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";

type ReviewQuestion = { lessonId: string; lessonTitle: string; questionId: string; prompt: string; answer: string; hint: string; choices?: string[] };

export function ReviewPlayer({ demo }: { demo: boolean }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
  const [answers, setAnswers] = useState<Array<{ lessonId: string; questionId: string; answer: string }>>([]);
  const [finished, setFinished] = useState(false);
  const question = questions[index];

  const demoQuestions = useMemo(() => {
    if (!state) return [];
    const sourceLessons = state.completedLessons.map((entry) => lessonById.get(entry.id)).filter(Boolean);
    const pool = (sourceLessons.length ? sourceLessons : [lessons[0]]).flatMap((lesson) => lesson!.practice.slice(0, 2).map((item) => ({ lessonId: lesson!.id, lessonTitle: lesson!.title, questionId: item.id, prompt: item.prompt, answer: item.answer, hint: item.hint, choices: item.choices })));
    return Array.from({ length: Math.min(5, Math.max(3, state.dueReview)) }, (_, i) => pool[i % pool.length]);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    if (demo) { setQuestions(demoQuestions); setReady(true); return; }
    fetch("/api/review").then(async (response) => {
      const body = await response.json() as { questions?: ReviewQuestion[] };
      setQuestions(body.questions ?? []); setReady(true);
    }).catch(() => setReady(true));
  }, [demo, demoQuestions, state]);

  if (loading || !ready) return <main className="loading-page" role="status"><div className="loading-mark">◇</div><p>Gathering today’s review…</p></main>;
  if (!state || error) return <main className="auth-gate"><div className="auth-card"><span className="auth-orbit">◇</span><h1>Sign in to open Daily Review.</h1><a className="primary-button" href="/#join">Continue with Google <span>→</span></a></div></main>;
  const activeState = state;
  if (!questions.length) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="review-empty"><span>✓</span><span className="section-kicker">REVIEW COMPLETE</span><h1>Your queue is clear.</h1><p>Nothing is due right now. Keep moving or revisit any completed lesson from the trail.</p><a className="primary-button" href={demo ? "/learn?demo=1" : "/learn"}>Return to the trail <span>→</span></a></section></main>;

  function check() { setFeedback(isAnswerCorrect(answer, question.answer) ? "correct" : "incorrect"); }
  async function next() {
    const submitted = [...answers, { lessonId: question.lessonId, questionId: question.questionId, answer }];
    setAnswers(submitted);
    if (index < questions.length - 1) { setIndex((value) => value + 1); setAnswer(""); setFeedback(""); return; }
    if (demo) {
      const nextState: LearnerState = { ...activeState, dueReview: 0, totalXp: activeState.totalXp + 20, weeklyXp: activeState.weeklyXp + 20 };
      saveDemoState(nextState); setState(nextState);
    } else {
      const response = await fetch("/api/review", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ answers: submitted }) });
      const body = await response.json() as { state?: LearnerState };
      if (body.state) setState(body.state);
    }
    setFinished(true);
  }

  if (finished) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="review-finish"><div className="review-ring"><span>+20</span><small>XP</small></div><span className="section-kicker">DAILY REVIEW COMPLETE</span><h1>You strengthened the path.</h1><p>Small returns make ideas easier to find next time. Today’s set is done.</p><a className="primary-button" href={demo ? "/learn?demo=1" : "/learn"}>Back to your trail <span>→</span></a></section></main>;

  return (
    <main className="learner-shell review-shell">
      <LearnerHeader state={state} demo={demo} />
      <section className="review-layout">
        <aside><span className="section-kicker">5-MINUTE REVIEW</span><h1>Bring it back before it fades.</h1><p>These ideas are here because a little practice today makes tomorrow easier.</p><div className="review-schedule"><span className="done">1 day</span><i /><span>3 days</span><i /><span>7 days</span><i /><span>14 days</span></div><small>Today’s review adds 20 XP once complete.</small></aside>
        <div className="review-card">
          <header><div><span className="section-kicker">{question.lessonTitle.toUpperCase()}</span><h2>{question.prompt}</h2></div><span>{index + 1}/{questions.length}</span></header>
          {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" onClick={() => { setAnswer(choice); setFeedback(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") check(); }} placeholder="Type your answer" autoFocus /></label>}
          {feedback === "incorrect" && <div className="feedback-card incorrect"><span>Not yet</span><p>{question.hint}</p></div>}
          {feedback === "correct" && <div className="feedback-card correct"><span>Memory found</span><p>That idea will return a little later, with more space between reviews.</p></div>}
          <div className="practice-actions"><span className="review-dots">{questions.map((item, dot) => <i className={dot < index ? "done" : dot === index ? "active" : ""} key={`${item.lessonId}-${dot}`} />)}</span>{feedback === "correct" ? <button className="primary-button" type="button" onClick={next}>{index === questions.length - 1 ? "Finish review" : "Next question"} <span>→</span></button> : <button className="primary-button" type="button" onClick={check} disabled={!answer.trim()}>Check answer <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
