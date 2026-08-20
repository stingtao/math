"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { LessonDefinition } from "@/lib/curriculum";
import { getGradeCurriculum, getGradeLessons, getRegion, isAnswerCorrect, nextLesson } from "@/lib/curriculum";
import { completeDemoLesson, type LearnerState } from "@/lib/learner-state";
import { ConceptVisual } from "./ConceptVisual";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";

const stageLabels = ["Goal", "See it", "Key idea", "Example", "Practice"];

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const question = lesson.practice[questionIndex];
  const region = getRegion(lesson.regionId);
  const completeMap = useMemo(() => new Map(state?.completedLessons.map((item) => [item.id, item.stars]) ?? []), [state]);

  if (loading) return <main className="loading-page" role="status"><div className="loading-mark">M</div><p>Opening your lesson…</p></main>;
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
  if (!isAvailable) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="locked-lesson"><span className="lock-large">·</span><span className="section-kicker">FOLLOW THE TRAIL</span><h1>This lesson is just ahead.</h1><p>Complete your current step first. The trail will bring you here next.</p><a className="primary-button" href={trailUrl}>Back to your trail <span>→</span></a></section></main>;

  function advanceStage() { setStage((value) => Math.min(4, value + 1)); }

  async function submitAnswer() {
    if (!answer.trim() || busy) return;
    setBusy(true);
    const priorAttempts = attempts[question.id] ?? 0;
    let correct = isAnswerCorrect(answer, question.answer);
    if (!demo) {
      const response = await fetch("/api/answer", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ lessonId: lesson.id, questionId: question.id, answer, usedHint: Boolean(hinted[question.id]) }) });
      const body = await response.json() as { correct?: boolean; error?: string };
      if (!response.ok) { setErrorMessage(body.error ?? "We could not check that answer."); setBusy(false); return; }
      correct = Boolean(body.correct);
    }
    setAttempts((current) => ({ ...current, [question.id]: priorAttempts + 1 }));
    if (priorAttempts === 0) setFirstCorrect((current) => ({ ...current, [question.id]: correct }));
    setFeedback(correct ? "correct" : "incorrect");
    setBusy(false);
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
    setStars(earnedStars);
    if (demo) setState(completeDemoLesson(activeState, lesson.id, earnedStars));
    else {
      const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "completeLesson", lessonId: lesson.id }) });
      const body = await response.json() as { stars?: number; state?: LearnerState; error?: string };
      if (!response.ok) { setErrorMessage(body.error ?? "We could not save your progress."); return; }
      setStars(body.stars ?? earnedStars);
      if (body.state) setState(body.state);
    }
    setFinished(true);
  }

  function useHint() {
    setShowHint(true);
    setHinted((current) => ({ ...current, [question.id]: true }));
  }

  if (finished) {
    const following = nextLesson(lesson);
    const regionFinished = lesson.order === 4;
    return (
      <main className="learner-shell celebration-page">
        <LearnerHeader state={state} demo={demo} />
        <section className={`celebration-card accent-${lesson.accent}`}>
          <div className="celebration-orbit"><span>✓</span><i /><i /></div>
          <span className="section-kicker">LESSON COMPLETE</span>
          <h1>That step is yours.</h1>
          <p>You finished every correction in <strong>{lesson.title}</strong>. Accuracy earns stars; persistence moves the trail.</p>
          <div className="earned-stars" aria-label={`${stars} out of 3 stars`}>{"★".repeat(stars)}{"☆".repeat(3 - stars)}</div>
          <div className="reward-strip"><span><strong>+{40 + (stars === 3 ? 10 : stars === 2 ? 5 : 0)}</strong> XP</span><span><strong>{stars}/3</strong> stars</span><span><strong>1</strong> step forward</span></div>
          <div className="celebration-actions">
            <a className="secondary-button" href={trailUrl}>Back to trail</a>
            <a className="primary-button" href={regionFinished ? `/boss/${lesson.regionId}?grade=${lesson.grade}${demo ? "&demo=1" : ""}` : `/learn/${following?.slug}?grade=${lesson.grade}${demo ? "&demo=1" : ""}`}>{regionFinished ? "Enter the boss quest" : "Take the next step"} <span>→</span></a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="learner-shell lesson-shell">
      <LearnerHeader state={state} demo={demo} />
      <div className="lesson-topline">
        <a href={trailUrl} className="back-link">← Trail</a>
        <div className="lesson-progress"><span style={{ width: `${((stage + (stage === 4 ? (questionIndex + 1) / 5 : 0)) / 5) * 100}%` }} /></div>
        <button className="sheet-button" type="button" disabled={!lesson.quickSheet} onClick={() => setSheetOpen(true)}>{lesson.quickSheet ? "Quick Sheet" : "Lesson notes"}</button>
      </div>
      <div className="lesson-layout">
        <aside className="lesson-sidebar">
          <span className={`lesson-region-badge accent-${lesson.accent}`}>{String(region?.order ?? 1).padStart(2, "0")}</span>
          <span className="section-kicker">GRADE {lesson.grade} · REGION {region?.order ?? 1} · LESSON {lesson.order}</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.goal}</p>
          <ol className="stage-list">{stageLabels.map((label, index) => <li className={index < stage ? "done" : index === stage ? "active" : ""} key={label}><span>{index < stage ? "✓" : index + 1}</span>{label}</li>)}</ol>
          <span className="standard-chip">{lesson.standard}</span>
        </aside>

        <section className="lesson-stage" aria-live="polite">
          {stage === 0 && <StageCard kicker="LEARNING GOAL" title={lesson.goal} copy="You do not need to be fast. Read each step, try the questions, and use a hint whenever it helps." visual={<div className={`goal-mark accent-${lesson.accent}`}><span>01</span><i /></div>} onContinue={advanceStage} />}
          {stage === 1 && <StageCard kicker="SEE IT" title="Build a picture before a rule." copy="Move through the visual, then describe what stays the same in your own words." visual={<ConceptVisual lesson={lesson} />} onContinue={advanceStage} />}
          {stage === 2 && <StageCard kicker="KEY IDEA" title={lesson.keyIdea} copy="Keep this sentence close. It is the shortest path through the questions ahead." visual={<div className={`key-idea-card accent-${lesson.accent}`}><span>KEY IDEA</span><strong>{lesson.keyIdea}</strong></div>} onContinue={advanceStage} />}
          {stage === 3 && <StageCard kicker="WORKED EXAMPLE" title={lesson.example} copy="One step at a time—nothing hidden." visual={<ol className="example-steps">{lesson.exampleSteps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>} onContinue={advanceStage} />}
          {stage === 4 && (
            <div className="practice-stage">
              <div className="practice-heading"><div><span className="section-kicker">PRACTICE · {questionIndex + 1} OF {lesson.practice.length}</span><h2>{question.prompt}</h2></div><div className="practice-dots">{lesson.practice.map((item, index) => <span className={index < questionIndex ? "done" : index === questionIndex ? "active" : ""} key={item.id} />)}</div></div>
              {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" key={choice} onClick={() => { setAnswer(choice); setFeedback(""); }}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") void submitAnswer(); }} placeholder="Type your answer" autoFocus /></label>}
              {showHint && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
              {feedback === "incorrect" && <div className="feedback-card incorrect"><span>Not yet</span><p>Try this step: {question.hint}</p></div>}
              {feedback === "correct" && <div className="feedback-card correct"><span>That works</span><p>You corrected the idea. That is what moves the trail.</p></div>}
              {errorMessage && <p className="form-error">{errorMessage}</p>}
              <div className="practice-actions"><button className="hint-button" type="button" onClick={useHint} disabled={showHint}>◇ {showHint ? "Hint open" : "Show a hint"}</button>{feedback === "correct" ? <button className="primary-button" type="button" onClick={continuePractice}>{questionIndex === lesson.practice.length - 1 ? "Finish lesson" : "Next question"} <span>→</span></button> : <button className="primary-button" type="button" disabled={!answer.trim() || busy} onClick={submitAnswer}>{busy ? "Checking…" : "Check answer"} <span>→</span></button>}</div>
            </div>
          )}
        </section>
      </div>
      {sheetOpen && lesson.quickSheet && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${lesson.title} quick sheet`}><div className="sheet-modal"><button className="modal-close" type="button" onClick={() => setSheetOpen(false)} aria-label="Close quick sheet">×</button><Image src={lesson.quickSheet} width={1920} height={1080} alt={`${lesson.title} visual summary with key idea, worked example, and two practice questions`} /><a href={lesson.quickSheet} download>Download Quick Sheet</a></div></div>}
    </main>
  );
}

function StageCard({ kicker, title, copy, visual, onContinue }: { kicker: string; title: string; copy: string; visual: React.ReactNode; onContinue: () => void }) {
  return <div className="stage-card"><div className="stage-copy"><span className="section-kicker">{kicker}</span><h2>{title}</h2><p>{copy}</p></div><div className="stage-visual">{visual}</div><div className="stage-footer"><span>Take your time. There is no countdown.</span><button className="primary-button" type="button" onClick={onContinue}>I’m ready <span>→</span></button></div></div>;
}

function LessonGate() {
  return <main className="auth-gate"><a className="brand" href="/"><span className="brand-mark">M</span><span>Math</span></a><div className="auth-card"><span className="auth-orbit">✦</span><span className="section-kicker">SAVE YOUR LEARNING</span><h1>Sign in before the lesson.</h1><p>This keeps progress connected to your anonymous trail.</p><a className="primary-button" href="/#join">Continue with Google <span>→</span></a></div></main>;
}
