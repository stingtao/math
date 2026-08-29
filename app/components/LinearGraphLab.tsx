"use client";

import { useId, useMemo, useState } from "react";
import { clippedLinePoints, parseLinearFunction, valueAt } from "@/lib/linear-function";

const graphBound = 5;
const graphSize = 280;
const graphOffsetX = 42;
const graphOffsetY = 12;
const graphTicks = Array.from({ length: 11 }, (_, index) => index - graphBound);
const defaultExamples = ["y=2x", "y=-x+3", "y=0.5x-2"];

function graphX(value: number) {
  return graphOffsetX + (value + graphBound) * (graphSize / (graphBound * 2));
}

function graphY(value: number) {
  return graphOffsetY + (graphBound - value) * (graphSize / (graphBound * 2));
}

function shownNumber(value: number) {
  return String(Math.round(value * 100) / 100).replace("-0", "0");
}

export function LinearGraphLab({ initialEquation = "y=2x", examples = defaultExamples }: { initialEquation?: string; examples?: string[] }) {
  const inputId = useId();
  const [equation, setEquation] = useState(initialEquation);
  const line = useMemo(() => parseLinearFunction(equation), [equation]);
  const segment = line ? clippedLinePoints(line, graphBound) : null;
  const table = line ? [-2, 0, 2].map((x) => ({ x, y: valueAt(line, x) })) : [];
  const visibleTable = table.filter((point) => Math.abs(point.y) <= 50);

  return (
    <section className="linear-graph-lab" aria-labelledby={`${inputId}-title`}>
      <header className="linear-graph-lab-heading">
        <div><small>TRY IT · LIVE GRAPH</small><strong id={`${inputId}-title`}>Type a line and watch it move.</strong><p>Use slope-intercept form: y = mx + b.</p></div>
        <span>Private on this device</span>
      </header>
      <div className="linear-graph-controls">
        <label htmlFor={inputId}>Equation</label>
        <div className={line ? "linear-equation-field valid" : "linear-equation-field invalid"}>
          <input id={inputId} value={equation} onChange={(event) => setEquation(event.target.value)} inputMode="text" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-invalid={!line} aria-describedby={`${inputId}-help`} />
          <span aria-hidden="true">{line ? "✓" : "?"}</span>
        </div>
        <div className="linear-example-buttons" aria-label="Example equations">
          {examples.map((example) => <button type="button" onClick={() => setEquation(example)} key={example}>{example}</button>)}
        </div>
        <p id={`${inputId}-help`} className={line ? "linear-equation-help" : "linear-equation-help error"} aria-live="polite">
          {line ? `${line.equation} has slope ${shownNumber(line.slope)} and crosses the y-axis at ${shownNumber(line.intercept)}.` : "Try y=2x, y=-x+3, or y=1/2x-2."}
        </p>
      </div>
      <div className="linear-graph-workspace">
        <div className="linear-graph-canvas">
          <svg viewBox="0 0 344 308" role="img" aria-label={line ? `Coordinate graph of ${line.equation}` : "Empty coordinate grid waiting for a valid linear equation"}>
            <defs><clipPath id={`${inputId}-clip`}><rect x={graphOffsetX} y={graphOffsetY} width={graphSize} height={graphSize} rx="8" /></clipPath></defs>
            <rect className="linear-graph-paper" x={graphOffsetX} y={graphOffsetY} width={graphSize} height={graphSize} rx="8" />
            {graphTicks.map((tick) => <g className="linear-graph-grid" key={`grid-${tick}`}><line x1={graphX(tick)} y1={graphOffsetY} x2={graphX(tick)} y2={graphOffsetY + graphSize} /><line x1={graphOffsetX} y1={graphY(tick)} x2={graphOffsetX + graphSize} y2={graphY(tick)} /></g>)}
            <line className="linear-graph-axis" x1={graphOffsetX} y1={graphY(0)} x2={graphOffsetX + graphSize} y2={graphY(0)} />
            <line className="linear-graph-axis" x1={graphX(0)} y1={graphOffsetY} x2={graphX(0)} y2={graphOffsetY + graphSize} />
            {[-4, -2, 2, 4].map((tick) => <g className="linear-graph-label" key={`label-${tick}`}><text x={graphX(tick)} y={graphY(0) + 18} textAnchor="middle">{tick}</text><text x={graphX(0) - 9} y={graphY(tick) + 4} textAnchor="end">{tick}</text></g>)}
            <text className="linear-graph-axis-name" x={graphOffsetX + graphSize - 8} y={graphY(0) - 9}>x</text><text className="linear-graph-axis-name" x={graphX(0) + 9} y={graphOffsetY + 15}>y</text>
            {line && segment && <g clipPath={`url(#${inputId}-clip)`} key={line.equation}>
              <line className="linear-graph-line" x1={graphX(segment[0].x)} y1={graphY(segment[0].y)} x2={graphX(segment[1].x)} y2={graphY(segment[1].y)} />
              {table.filter((point) => Math.abs(point.y) <= graphBound).map((point) => <circle className="linear-graph-point" cx={graphX(point.x)} cy={graphY(point.y)} r="5" key={`${point.x}-${point.y}`} />)}
              {Math.abs(line.intercept) <= graphBound && <circle className="linear-graph-intercept" cx={graphX(0)} cy={graphY(line.intercept)} r="7" />}
            </g>}
          </svg>
        </div>
        <aside className="linear-graph-reading" aria-live="polite">
          <div><small>SLOPE · m</small><strong>{line ? shownNumber(line.slope) : "—"}</strong><p>{line ? line.slope > 0 ? "Rises left to right" : line.slope < 0 ? "Falls left to right" : "Stays horizontal" : "Rate of change"}</p></div>
          <div><small>Y-INTERCEPT · b</small><strong>{line ? shownNumber(line.intercept) : "—"}</strong><p>{line ? `Starts at (0, ${shownNumber(line.intercept)})` : "Where x = 0"}</p></div>
          {line && <table><caption>Three points on this line</caption><thead><tr><th>x</th><th>y</th></tr></thead><tbody>{visibleTable.map((point) => <tr key={point.x}><td>{point.x}</td><td>{shownNumber(point.y)}</td></tr>)}</tbody></table>}
        </aside>
      </div>
      <footer><span aria-hidden="true">◇</span>Your equation stays in this lesson. It is not saved or sent anywhere.</footer>
    </section>
  );
}
