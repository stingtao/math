"use client";

import { useMemo, useState } from "react";
import type { RegionDefinition } from "@/lib/curriculum";
import { isAnswerCorrect } from "@/lib/curriculum";
import { saveDemoState, type LearnerState } from "@/lib/learner-state";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";

export function BossPlayer({ region, demo }: { region: RegionDefinition; demo: boolean }) {
  const { state, setState, loading, error } = useLearner(demo);
  const questions = useMemo(() => [...region.lessons.map((item) => ({ ...item.practice[0], lesson: item.title })), { ...region.lessons[0].practice[1], lesson: "Mixed mastery" }], [region]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);
  const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
  const [showHint, setShowHint] = useState(false);
  const [failed, setFailed] = useState(false);
  const [repair, setRepair] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [busy, setBusy] = useState(false);
  const question = questions[index];

  if (loading) return <main className="loading-page" role="status"><div className="loading-mark">★</div><p>Preparing the quest…</p></main>;
  if (!state || error) return <main className="auth-gate"><div className="auth-card"><span className="auth-orbit">★</span><h1>Sign in to enter a boss quest.</h1><a className="primary-button" href="/#join">Continue with Google <span>→</span></a></div></main>;
  const activeState = state;
  const completed = new Set(state.completedLessons.map((item) => item.id));
  const unlocked = region.lessons.every((item) => completed.has(item.id));
  if (!unlocked) return <main className="learner-shell"><LearnerHeader state={state} demo={demo} /><section className="locked-lesson"><span className="lock-large">★</span><span className="section-kicker">BOSS LOCKED</span><h1>Four small steps come first.</h1><p>Complete every lesson in {region.title}, then return for the mixed quest.</p><a className="primary-button" href={demo ? "/learn?demo=1" : "/learn"}>Back to your trail <span>→</span></a></section></main>;

  function check() {
    if (!answer.trim()) return;
    if (isAnswerCorrect(answer, question.answer)) setFeedback("correct");
    else {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setFeedback("incorrect");
      setShowHint(true);
      if (nextHearts === 0) setFailed(true);
    }
  }

  async function next() {
    if (feedback !== "correct") return;
    const finalAnswers = [...answers, answer];
    setAnswers(finalAnswers);
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setAnswer("");
      setFeedback("");
      setShowHint(false);
      return;
    }
    setBusy(true);
    if (demo) {
      const already = activeState.clearedBosses.some((item) => item.regionId === region.id);
      const next: LearnerState = {
        ...activeState,
        clearedBosses: already ? activeState.clearedBosses.map((item) => item.regionId === region.id ? { ...item, hearts: Math.max(item.hearts, hearts) } : item) : [...activeState.clearedBosses, { regionId: region.id, hearts }],
        totalXp: activeState.totalXp + (already ? 0 : 100),
        weeklyXp: activeState.weeklyXp + (already ? 0 : 100),
      };
      saveDemoState(next);
      setState(next);
    } else {
      const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "completeBoss", regionId: region.id, answers: finalAnswers, hearts }) });
      const body = await response.json() as { state?: LearnerState; error?: string };
      if (!response.ok) { setFailed(true); setBusy(false); return; }
      if (body.state) setState(body.state);
    }
    setBusy(false);
    setCleared(true);
  }

  function finishRepair() {
    if (repair < 1) { setRepair((value) => value + 1); return; }
    setIndex(0); setAnswer(""); setAnswers([]); setHearts(3); setFeedback(""); setShowHint(false); setFailed(false); setRepair(0);
  }

  if (cleared) return <main className={`boss-shell accent-${region.accent}`}><LearnerHeader state={state} demo={demo} /><section className="boss-victory"><div className="boss-medal">★</div><span className="section-kicker">REGION {region.id} CLEARED</span><h1>You connected the ideas.</h1><p>The boss was not about speed. It was proof that four small lessons can become one strong skill.</p><div className="earned-stars hearts-result">{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</div><div className="reward-strip"><span><strong>+100</strong> XP</span><span><strong>{hearts}/3</strong> hearts</span><span><strong>1</strong> badge</span></div><a className="primary-button" href={demo ? "/learn?demo=1" : "/learn"}>{region.id === 13 ? "View the complete trail" : "Open the next region"} <span>→</span></a></section></main>;

  if (failed) return <main className="boss-shell"><LearnerHeader state={state} demo={demo} /><section className="repair-card"><span className="repair-icon">◇</span><span className="section-kicker">TRAIL CAMP</span><h1>Pause. Repair. Try again.</h1><p>No XP lost. Work through two tiny reminders, then return with three fresh hearts.</p><div className="repair-question"><span>{repair + 1} OF 2</span><strong>{repair === 0 ? region.lessons[Math.min(index, 3)].keyIdea : "A correction is progress, not a penalty."}</strong><p>{repair === 0 ? region.lessons[Math.min(index, 3)].exampleSteps[0] : "Take one breath, read the structure, then choose your first step."}</p></div><button className="primary-button" type="button" onClick={finishRepair}>{repair === 0 ? "Next reminder" : "Return with 3 hearts"} <span>→</span></button></section></main>;

  return (
    <main className={`boss-shell accent-${region.accent}`}>
      <LearnerHeader state={state} demo={demo} />
      <div className="boss-topbar"><a href={demo ? "/learn?demo=1" : "/learn"}>← Leave quest</a><div className="boss-rounds">{questions.map((item, round) => <span className={round < index ? "done" : round === index ? "active" : ""} key={`${item.id}-${round}`} />)}</div><div className="boss-hearts" aria-label={`${hearts} hearts remaining`}>{"♥".repeat(hearts)}{"♡".repeat(3 - hearts)}</div></div>
      <section className="boss-arena">
        <div className="boss-title"><span className="section-kicker">REGION {region.id} BOSS · ROUND {index + 1} OF 5</span><h1>{region.title}</h1><p>Four lesson checks. One mixed finish. No timer.</p></div>
        <div className="boss-question-card">
          <span className="boss-topic">{question.lesson}</span>
          <h2>{question.prompt}</h2>
          {question.choices ? <div className="choice-grid">{question.choices.map((choice) => <button className={answer === choice ? "selected" : ""} type="button" onClick={() => { setAnswer(choice); setFeedback(""); }} key={choice}>{choice}</button>)}</div> : <label className="answer-field"><span>Your answer</span><input value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") check(); }} placeholder="Type your answer" autoFocus /></label>}
          {showHint && <div className="hint-card"><span>TRAIL HINT</span><p>{question.hint}</p></div>}
          {feedback === "incorrect" && <div className="feedback-card incorrect"><span>One heart used</span><p>Correct this question to keep moving. {question.hint}</p></div>}
          {feedback === "correct" && <div className="feedback-card correct"><span>Path found</span><p>This idea is ready to connect with the next one.</p></div>}
          <div className="practice-actions"><button className="hint-button" type="button" onClick={() => setShowHint(true)}>◇ Show one free hint</button>{feedback === "correct" ? <button className="primary-button" type="button" onClick={next} disabled={busy}>{index === 4 ? "Clear the boss" : "Next round"} <span>→</span></button> : <button className="primary-button" type="button" onClick={check} disabled={!answer.trim()}>Check answer <span>→</span></button>}</div>
        </div>
      </section>
    </main>
  );
}
