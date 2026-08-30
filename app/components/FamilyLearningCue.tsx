type FamilyLearningMoment = "start" | "practice" | "retry" | "success" | "finish";

const cues: Record<FamilyLearningMoment, { title: string; prompt: string; note: string }> = {
  start: {
    title: "Begin with curiosity, not an explanation.",
    prompt: "Ask: “What do you notice, and what do you think this lesson might help us figure out?”",
    note: "Give your child time to form an idea before you add yours.",
  },
  practice: {
    title: "Let your child make the first move.",
    prompt: "Ask: “What could you try first?” Then wait. A quiet pause is part of the learning.",
    note: "You do not need to know the answer in advance. Listen for the child’s reasoning.",
  },
  retry: {
    title: "Treat the miss as useful information.",
    prompt: "Ask: “Which part still feels right, and where did the answer start to change?”",
    note: "Use the on-screen clue after your child has described one step in their own words.",
  },
  success: {
    title: "Make the thinking visible.",
    prompt: "Ask: “How would you explain that move to me without using the answer?”",
    note: "A short explanation helps turn one correct answer into an idea your child can reuse.",
  },
  finish: {
    title: "End with one small reflection.",
    prompt: "Ask: “What became easier today, and what should we try together next time?”",
    note: "Stop while the conversation still feels positive. Another session can continue from here.",
  },
};

export function FamilyLearningCue({ moment }: { moment: FamilyLearningMoment }) {
  const cue = cues[moment];
  return (
    <aside className={`family-learning-cue family-cue-${moment}`} aria-label="Prompt for the parent or guardian">
      <span className="family-cue-icon" aria-hidden="true">♡</span>
      <div>
        <small>FOR THE GROWN-UP BESIDE THE LEARNER</small>
        <h3>{cue.title}</h3>
        <p>{cue.prompt}</p>
        <span>{cue.note}</span>
      </div>
    </aside>
  );
}
