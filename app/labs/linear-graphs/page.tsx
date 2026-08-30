import type { Metadata } from "next";
import { LinearGraphLab } from "@/app/components/LinearGraphLab";
import { PointToLineMission } from "@/app/components/PointToLineMission";
import { PublicHeader } from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Linear Graph Lab · Math",
  description: "Plot a rover route, connect the points, and see how y = 2x + 1 becomes a line.",
};

const graphExamples = ["y=2x+1", "y=3x", "y=-x+4", "y=3", "y=1/2x-2", "y=2x-1"];

function RoverRouteVisual() {
  return (
    <div className="graph-lab-rover-card">
      <svg viewBox="0 0 520 340" role="img" aria-labelledby="rover-route-title rover-route-description">
        <title id="rover-route-title">Nova rover route shown as the line y equals 2x plus 1</title>
        <desc id="rover-route-description">Nova begins one kilometer from base and travels two kilometers farther each hour. Five signals form a rising straight line.</desc>
        <rect className="rover-visual-sky" x="8" y="8" width="504" height="324" rx="28" />
        <circle className="rover-visual-moon" cx="430" cy="68" r="27" />
        <path className="rover-visual-ground" d="M 8 264 Q 118 220 224 258 T 512 240 L 512 332 L 8 332 Z" />
        <g className="rover-visual-grid">
          <line x1="68" y1="262" x2="452" y2="262" /><line x1="68" y1="56" x2="68" y2="262" />
          <line x1="68" y1="222" x2="452" y2="222" /><line x1="68" y1="182" x2="452" y2="182" /><line x1="68" y1="142" x2="452" y2="142" /><line x1="68" y1="102" x2="452" y2="102" />
          <line x1="144" y1="56" x2="144" y2="262" /><line x1="220" y1="56" x2="220" y2="262" /><line x1="296" y1="56" x2="296" y2="262" /><line x1="372" y1="56" x2="372" y2="262" />
        </g>
        <path className="rover-visual-line" d="M 68 242 L 372 82" />
        {[{ x: 68, y: 242 }, { x: 144, y: 202 }, { x: 220, y: 162 }, { x: 296, y: 122 }, { x: 372, y: 82 }].map((point, index) => <g key={index} className="rover-visual-point"><circle cx={point.x} cy={point.y} r="10" /><text x={point.x} y={point.y + 5} textAnchor="middle">{index + 1}</text></g>)}
        <g className="rover-visual-machine" transform="translate(360 224)">
          <path d="M 18 8 L 33 -8 L 48 8" /><rect x="8" y="7" width="52" height="26" rx="7" /><circle cx="19" cy="38" r="9" /><circle cx="50" cy="38" r="9" /><line x1="34" y1="7" x2="34" y2="-16" /><circle cx="34" cy="-18" r="4" />
        </g>
        <g className="rover-visual-bubble">
          <path d="M 244 28 H 419 Q 433 28 433 42 V 76 Q 433 90 419 90 H 324 L 305 106 L 307 90 H 244 Q 230 90 230 76 V 42 Q 230 28 244 28 Z" />
          <text x="331" y="67" textAnchor="middle">y = 2x + 1</text>
        </g>
        <text className="rover-visual-axis-label" x="400" y="287">hours · x</text><text className="rover-visual-axis-label" x="82" y="78">km · y</text>
      </svg>
      <div><span><b>+1 km</b> at the start</span><span><b>+2 km</b> each hour</span></div>
    </div>
  );
}

function AlgebraGeometryBridge() {
  return (
    <div className="graph-history-visual" aria-label="An equation and a coordinate graph describe the same rover route">
      <div className="history-equation-card"><small>ALGEBRA</small><code>y = 2x + 1</code><span>one rule</span></div>
      <div className="history-bridge-arrow" aria-hidden="true"><span>→</span><b>same idea</b></div>
      <svg viewBox="0 0 250 210" role="img" aria-label="Coordinate graph of y equals 2x plus 1">
        <rect x="8" y="8" width="234" height="194" rx="18" />
        <g className="history-graph-grid">
          <line x1="42" y1="172" x2="222" y2="172" /><line x1="42" y1="30" x2="42" y2="172" />
          <line x1="87" y1="30" x2="87" y2="172" /><line x1="132" y1="30" x2="132" y2="172" /><line x1="177" y1="30" x2="177" y2="172" />
          <line x1="42" y1="137" x2="222" y2="137" /><line x1="42" y1="102" x2="222" y2="102" /><line x1="42" y1="67" x2="222" y2="67" />
        </g>
        <path className="history-graph-line" d="M 42 154 L 200 34" />
        <g className="history-graph-points"><circle cx="42" cy="154" r="7" /><circle cx="87" cy="119" r="7" /><circle cx="132" cy="84" r="7" /><circle cx="177" cy="49" r="7" /></g>
        <text x="125" y="194" textAnchor="middle">GEOMETRY</text>
      </svg>
    </div>
  );
}

export default function LinearGraphsLabPage() {
  return (
    <main className="site-shell graph-lab-page">
      <PublicHeader />
      <aside className="family-presence-notice" aria-label="Parent-guided activity notice"><span aria-hidden="true">♡</span><p><strong>Explore this together.</strong> A parent or guardian should stay beside the learner. Entries in this public lab are not saved.</p></aside>
      <section className="graph-lab-hero">
        <div><span className="eyebrow">OPEN MATH LAB · LINEAR GRAPHS</span><h1>Plot a rover.<br />Reveal the rule.</h1><p>Nova starts 1 km from base and travels 2 km farther each hour. Turn its signals into points, connect the line, and discover why the route is y = 2x + 1.</p><div className="graph-lab-hero-actions"><a className="primary-button" href="#point-mission">Start the rover mission <span aria-hidden="true">↓</span></a><a className="text-link" href="#live-graph">Open the graph tool</a></div></div>
        <RoverRouteVisual />
      </section>

      <div className="public-point-mission" id="point-mission"><PointToLineMission /></div>

      <section className="public-linear-lab" id="live-graph" aria-labelledby="live-graph-heading">
        <header><span className="section-kicker">CHANGE THE MISSION</span><h2 id="live-graph-heading">What if Nova moves differently?</h2><p>Change the rate or starting distance. The line, points, and explanation update together.</p></header>
        <LinearGraphLab initialEquation="y=2x+1" examples={graphExamples} />
      </section>

      <section className="graph-history-story" aria-labelledby="graph-history-heading">
        <div className="graph-history-copy">
          <span className="section-kicker">MATH HISTORY · 1637</span><h2 id="graph-history-heading">When equations became pictures.</h2>
          <p>In the 1630s, René Descartes and Pierre de Fermat developed methods that connected algebra with geometric curves. Descartes published <em>La Géométrie</em> in 1637.</p>
          <p>You just used that bridge: <code>y = 2x + 1</code> is both a rule for Nova’s trip and a visible route on the coordinate plane.</p>
          <div className="graph-history-links"><a href="https://mathshistory.st-andrews.ac.uk/Biographies/Descartes/" target="_blank" rel="noreferrer">Read the history <span aria-hidden="true">↗</span></a><a href="https://www.loc.gov/item/32034972/" target="_blank" rel="noreferrer">See the 1637 book <span aria-hidden="true">↗</span></a></div>
        </div>
        <AlgebraGeometryBridge />
      </section>
    </main>
  );
}
