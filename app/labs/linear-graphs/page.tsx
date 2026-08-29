import type { Metadata } from "next";
import { LinearGraphLab } from "@/app/components/LinearGraphLab";
import { PointToLineMission } from "@/app/components/PointToLineMission";
import { PublicHeader } from "@/app/components/Header";
import { TopicIcon } from "@/app/components/TopicIcon";

export const metadata: Metadata = {
  title: "Linear Graph Lab · Math",
  description: "Type a linear equation and see its slope, y-intercept, points, and coordinate graph change instantly.",
};

const gradeConnections = [
  { grade: 7, title: "Proportional lines", copy: "A proportional relationship such as y = 2x passes through the origin because b = 0.", equation: "y=2x", visual: "ratio-table", accent: "coral" as const },
  { grade: 8, title: "Slope and intercept", copy: "In y = mx + b, m controls the rise and run while b sets the starting height.", equation: "y=2x+1", visual: "line-graph", accent: "blue" as const },
  { grade: 9, title: "Compare linear functions", copy: "Change m or b, then use the graph and point table to explain what changed.", equation: "y=-2x+3", visual: "function", accent: "violet" as const },
  { grade: 10, title: "Prove line relationships", copy: "Compare slopes to justify when coordinate lines are parallel or perpendicular.", equation: "y=1/2x-2", visual: "coordinate", accent: "coral" as const },
  { grade: 11, title: "Contrast function families", copy: "Use a straight line as the constant-rate reference before studying polynomial, logarithmic, and trigonometric curves.", equation: "y=3x-4", visual: "growth", accent: "teal" as const },
  { grade: 12, title: "Read a tangent model", copy: "Treat a line as a local approximation: its slope represents an instantaneous rate near one point.", equation: "y=-1/2x+3", visual: "slope", accent: "gold" as const },
];

const guidedChallenges = [
  { number: "01", title: "Find the origin", equation: "y=3x", prompt: "Where does every proportional line meet both axes?", check: "It passes through (0, 0). With b = 0, the y-intercept is the origin." },
  { number: "02", title: "Move the starting point", equation: "y=2x+3", prompt: "Compare this with y = 2x. What changes—and what stays?", check: "The slope stays 2. The whole line moves up 3, so it now crosses at (0, 3)." },
  { number: "03", title: "Read a falling line", equation: "y=-x+4", prompt: "As x increases by 1, how does y change?", check: "y falls by 1. The slope is −1, so the line moves down from left to right." },
  { number: "04", title: "Make it horizontal", equation: "y=3", prompt: "Why does the line never rise or fall?", check: "Every x has y = 3. The change in y is zero, so the slope is 0." },
  { number: "05", title: "Use a fractional rate", equation: "y=1/2x-2", prompt: "What rise and run can you repeat from the intercept?", check: "A slope of 1/2 means rise 1 and run 2. Start at (0, −2), then repeat that step." },
  { number: "06", title: "Test a point", equation: "y=2x-1", prompt: "Does the point (3, 5) lie on this line?", check: "Yes. Substituting x = 3 gives y = 2(3) − 1 = 5, so the point is on the line." },
];

export default function LinearGraphsLabPage() {
  return (
    <main className="site-shell graph-lab-page">
      <PublicHeader />
      <section className="graph-lab-hero">
        <div><span className="eyebrow">OPEN MATH LAB · GRADES 7–12</span><h1>Draw the line.<br />Decode the rule.</h1><p>Plot points, connect the pattern, then change an equation and watch the graph respond. No sign-in, timer, score, or saved input.</p><div className="graph-lab-hero-actions"><a className="primary-button" href="#point-mission">Start with five points <span aria-hidden="true">↓</span></a><a className="text-link" href="#live-graph">Type an equation instead</a></div></div>
        <div className="graph-lab-formula" aria-label="In y equals m x plus b, m is the slope and b is the y-intercept"><span>y</span><i>=</i><span className="graph-formula-term"><strong>m</strong><small>slope</small></span><b>x</b><i>+</i><span className="graph-formula-term"><em>b</em><small>y-intercept</small></span></div>
      </section>

      <section className="public-point-mission" id="point-mission" aria-labelledby="point-mission-heading">
        <header><span className="section-kicker">PLOT · CONNECT · DECODE</span><h2 id="point-mission-heading">Turn five points into y = 2x.</h2><p>Place each ordered pair. Connect the pattern. Then read coordinates back from the line you built.</p></header>
        <PointToLineMission />
      </section>

      <section className="public-linear-lab" id="live-graph" aria-labelledby="live-graph-heading">
        <header><span className="section-kicker">CHANGE · NOTICE · EXPLAIN</span><h2 id="live-graph-heading">Type y = 2x. Then break the pattern.</h2><p>Try a negative slope, decimal slope, or new intercept. The line, point table, and explanation update together.</p></header>
        <LinearGraphLab initialEquation="y=2x" examples={guidedChallenges.map((challenge) => challenge.equation)} />
      </section>

      <section className="graph-lab-challenges" aria-labelledby="graph-challenges-heading">
        <header><span className="section-kicker">SIX QUICK TESTS</span><h2 id="graph-challenges-heading">Predict first. Check second.</h2><p>Try each equation above. Say what you expect the line to do, then open the reasoning.</p></header>
        <div>{guidedChallenges.map((challenge) => <article key={challenge.number}><span>{challenge.number}</span><code>{challenge.equation}</code><h3>{challenge.title}</h3><p>{challenge.prompt}</p><details><summary>Check my reasoning</summary><div>{challenge.check}</div></details></article>)}</div>
      </section>

      <section className="graph-lab-connections" aria-labelledby="grade-connections-heading">
        <header><span className="section-kicker">ONE TOOL · SIX GRADE PATHS</span><h2 id="grade-connections-heading">This line keeps showing up.</h2></header>
        <div>{gradeConnections.map((item) => <article className={`accent-${item.accent}`} key={item.grade}><TopicIcon visual={item.visual} accent={item.accent} size="md" label="" /><span>GRADE {item.grade}</span><h3>{item.title}</h3><p>{item.copy}</p><code>{item.equation}</code></article>)}</div>
        <footer><span aria-hidden="true">◇</span><p><strong>Private by default.</strong> Equations entered here remain in this browser tab and are never connected to an account, lesson history, or leaderboard.</p></footer>
      </section>
    </main>
  );
}
