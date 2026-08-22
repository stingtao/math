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
import { SuccessBurst } from "./SuccessBurst";
import { TopicIcon } from "./TopicIcon";

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
  const correctedCount = questionIndex + (feedback === "correct" ? 1 : 0);
  const firstTryCount = Object.values(firstCorrect).filter(Boolean).length;
  const firstTryAnswered = Object.keys(firstCorrect).length;
  const twoStarPathOpen = firstTryCount + (lesson.practice.length - firstTryAnswered) >= 4;
  const threeStarPathOpen = Object.values(firstCorrect).every(Boolean) && Object.keys(hinted).length === 0;
  const currentFirstTry = feedback === "correct" && Boolean(firstCorrect[question.id]) && !hinted[question.id];
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
    const masteryMessage = stars === 3 ? "No-hint mastery" : stars === 2 ? "Strong first pass" : "Complete after corrections";
    const masteryNext = stars === 3
      ? { title: "Mastery marker complete", copy: "This lesson is ready for spaced review. Your three-star marker stays on the trail." }
      : stars === 2
      ? { title: "One clean pass from mastery", copy: "A future no-hint review can turn this into a three-star skill." }
      : { title: "The path stays open", copy: "Corrections finished the lesson. Daily Review will bring the useful steps back at the right time." };
    const regionKeyCount = region?.lessons.filter((item) => item.id === lesson.id || completeMap.has(item.id)).length ?? lesson.order;
    return (
      <main className="learner-shell celebration-page">
        <SuccessBurst eventKey={`${lesson.id}-complete-${stars}`} large />
        <LearnerHeader state={state} demo={demo} />
        <section className={`celebration-card accent-${lesson.accent}`}>
          <div className="celebration-emblem"><TopicIcon visual={lesson.visual} accent={lesson.accent} size="xl" label={`${lesson.title} completed`} /><span aria-hidden="true">✓</span></div>
          <span className="section-kicker">LESSON COMPLETE</span>
          <h1>That step is yours.</h1>
          <p><strong>{lesson.title}</strong> is complete. Corrections count.</p>
          <div className="earned-stars" aria-label={`${stars} out of 3 stars`}>{"★".repeat(stars)}{"☆".repeat(3 - stars)}</div>
          <strong className="mastery-message">{masteryMessage}</strong>
          <div className="mastery-next-goal"><span aria-hidden="true">{stars === 3 ? "✦" : stars === 2 ? "↑" : "↻"}</span><div><small>NEXT MASTERY GOAL</small><strong>{masteryNext.title}</strong><p>{masteryNext.copy}</p></div></div>
          <div className="quest-key-card" aria-label={`${regionKeyCount} of 4 quest keys collected in ${region?.title ?? "this region"}`}>
            <div className="quest-key-copy"><small>REGION QUEST KEYS</small><strong>{regionKeyCount} / 4 collected</strong><span>{regionKeyCount === 4 ? "Boss gate open" : `${4 - regionKeyCount} ${4 - regionKeyCount === 1 ? "key" : "keys"} until the boss`}</span></div>
            <div className="quest-key-nodes" aria-hidden="true">{region?.lessons.map((item, index) => {
              const collected = item.id === lesson.id || completeMap.has(item.id);
              return <span className={collected ? "collected" : index === regionKeyCount ? "next" : "locked"} key={item.id}>{collected ? "✓" : index + 1}</span>;
            })}<i /><b className={regionKeyCount === 4 ? "open" : ""}>★</b></div>
          </div>
          <div className="unlock-path" aria-label={regionFinished ? "Lesson complete and boss quest unlocked" : "Lesson complete and next lesson unlocked"}><span className="done"><b>✓</b> Lesson complete</span><i /><span><b>{regionFinished ? "★" : "→"}</b> {regionFinished ? "Boss quest unlocked" : "Next lesson unlocked"}</span></div>
          <div className="reward-strip"><span><strong>+{40 + (stars === 3 ? 10 : stars === 2 ? 5 : 0)}</strong> XP</span><span><strong>{stars}/3</strong> stars</span><span><strong>1</strong> step forward</span></div>
          <div className="session-save-card"><span aria-hidden="true">✓</span><div><small>SESSION WIN SAVED</small><strong>This is enough for today.</strong><p>You can stop here. Daily Review will bring this idea back when another short visit will help.</p></div></div>
          <div className="celebration-actions">
            <a className="secondary-button" href={trailUrl}>Back to trail</a>
            <a className="primary-button" href={regionFinished ? `/boss/${lesson.regionId}?grade=${lesson.grade}${demo ? "&demo=1" : ""}` : `/learn/${following?.slug}?grade=${lesson.grade}${demo ? "&demo=1" : ""}`}>{regionFinished ? "Optional: enter boss" : "Optional: next lesson"} <span>→</span></a>
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
            <div className="practice-stage">
              <div className="practice-heading"><div><span className="section-kicker">PRACTICE · {questionIndex + 1} OF {lesson.practice.length}</span><h2>{question.prompt}</h2></div><div className="practice-dots">{lesson.practice.map((item, index) => <span className={index < questionIndex ? "done" : index === questionIndex ? "active" : ""} key={item.id} />)}</div></div>
              <div className={`practice-charge accent-${lesson.accent}`} aria-label={`Focus charge: ${correctedCount} of ${lesson.practice.length} questions corrected`}><div><span>FOCUS CHARGE</span><strong>{focusChargeLabels[correctedCount]}</strong></div><div className="charge-cells" aria-hidden="true">{lesson.practice.map((item, index) => <i className={index < correctedCount ? "done" : index === correctedCount ? "current" : ""} key={item.id}>{index < correctedCount ? "✓" : index + 1}</i>)}</div><small>{correctedCount}/{lesson.practice.length}</small></div>
              <div className={`practice-star-path accent-${lesson.accent}`} aria-live="polite">
                <div className="star-path-heading"><div><span>STAR PATH</span><strong>Corrections always finish the lesson.</strong></div><small>Stars describe this run—they never block progress.</small></div>
                <div className="star-path-options">
                  <span className="live"><b>★</b><strong>Complete all 5</strong><small>{correctedCount}/5 corrected</small></span>
                  <span className={firstTryCount >= 4 ? "earned" : twoStarPathOpen ? "live" : "review"}><b>★★</b><strong>4 first tries</strong><small>{firstTryCount >= 4 ? "secured" : twoStarPathOpen ? `${firstTryCount}/4 so far` : "future review goal"}</small></span>
                  <span className={threeStarPathOpen ? "live" : "review"}><b>★★★</b><strong>Clean, no-hint run</strong><small>{threeStarPathOpen ? "path open" : "future review goal"}</small></span>
                </div>
              </div>
              {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" key={choice} onClick={() => { setAnswer(choice); setFeedback(""); }}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") void submitAnswer(); }} placeholder="Type your answer" autoFocus /></label>}
              {showHint && <div className="hint-card"><span>HINT</span><p>{question.hint}</p></div>}
              {feedback === "incorrect" && <div className="feedback-card incorrect recovery-feedback" role="status"><span className="recovery-symbol" aria-hidden="true">↻</span><div><strong>Not yet—try this step.</strong><p>{question.hint}</p><small>Correct it to add the same Focus Charge.</small></div></div>}
              {feedback === "correct" && <><SuccessBurst eventKey={`${lesson.id}-${question.id}`} /><div className={`feedback-card correct feedback-celebration ${currentFirstTry ? "first-try" : "recovered"}`} role="status"><span className="feedback-symbol" aria-hidden="true">✓</span><div><strong>{currentFirstTry ? "First-try spark!" : "Recovery complete!"}</strong><p>{practiceEncouragement[questionIndex]} Question {questionIndex + 1} is corrected.</p></div><span className="momentum-chip">{currentFirstTry ? "Clean +1" : "Recovered +1"}</span></div></>}
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
