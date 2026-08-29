"use client";

import { useId, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { clippedLinePoints, nearestVisibleLinePoint, parseLinearFunction, valueAt, type GraphPoint } from "@/lib/linear-function";

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

function coordinateNumber(value: number) {
  return value.toFixed(1).replace("-0.0", "0.0");
}

export function LinearGraphLab({ initialEquation = "y=2x", examples = defaultExamples }: { initialEquation?: string; examples?: string[] }) {
  const inputId = useId();
  const [equation, setEquation] = useState(initialEquation);
  const [hoverPoint, setHoverPoint] = useState<GraphPoint | null>(null);
  const line = useMemo(() => parseLinearFunction(equation), [equation]);
  const segment = line ? clippedLinePoints(line, graphBound) : null;
  const table = line ? [-2, 0, 2].map((x) => ({ x, y: valueAt(line, x) })) : [];
  const visibleTable = table.filter((point) => Math.abs(point.y) <= 50);
  const hoverScreenX = hoverPoint ? graphX(hoverPoint.x) : 0;
  const hoverScreenY = hoverPoint ? graphY(hoverPoint.y) : 0;
  const hoverBoxX = Math.max(4, Math.min(236, hoverScreenX + 11));
  const hoverBoxY = hoverScreenY < 52 ? hoverScreenY + 11 : hoverScreenY - 39;

  function pointNearPointer(event: ReactPointerEvent<SVGLineElement>) {
    if (!line) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const cursor = svg.createSVGPoint();
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    const local = cursor.matrixTransform(matrix.inverse());
    const pointer = {
      x: (local.x - graphOffsetX) / graphSize * graphBound * 2 - graphBound,
      y: graphBound - (local.y - graphOffsetY) / graphSize * graphBound * 2,
    };
    setHoverPoint(nearestVisibleLinePoint(line, pointer, graphBound));
  }

  function startKeyboardExplore() {
    if (!line || !segment) return;
    const midpoint = { x: (segment[0].x + segment[1].x) / 2, y: (segment[0].y + segment[1].y) / 2 };
    setHoverPoint(nearestVisibleLinePoint(line, midpoint, graphBound));
  }

  function moveKeyboardPoint(event: ReactKeyboardEvent<SVGLineElement>) {
    if (!line || !segment || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const midpointX = (segment[0].x + segment[1].x) / 2;
    const x = (hoverPoint?.x ?? midpointX) + (event.key === "ArrowRight" ? 0.1 : -0.1);
    setHoverPoint(nearestVisibleLinePoint(line, { x, y: valueAt(line, x) }, graphBound));
  }

  return (
    <section className="linear-graph-lab" aria-labelledby={`${inputId}-title`}>
      <header className="linear-graph-lab-heading">
        <div><small>TRY IT · LIVE GRAPH</small><strong id={`${inputId}-title`}>Type a line and watch it move.</strong><p>Use slope-intercept form: y = mx + b.</p></div>
        <span>Private on this device</span>
      </header>
      <div className="linear-graph-controls">
        <label htmlFor={inputId}>Equation</label>
        <div className={line ? "linear-equation-field valid" : "linear-equation-field invalid"}>
          <input id={inputId} value={equation} onChange={(event) => { setEquation(event.target.value); setHoverPoint(null); }} inputMode="text" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-invalid={!line} aria-describedby={`${inputId}-help`} />
          <span aria-hidden="true">{line ? "✓" : "?"}</span>
        </div>
        <div className="linear-example-buttons" aria-label="Example equations">
          {examples.map((example) => <button type="button" onClick={() => { setEquation(example); setHoverPoint(null); }} key={example}>{example}</button>)}
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
              <line className="linear-graph-hit-area" x1={graphX(segment[0].x)} y1={graphY(segment[0].y)} x2={graphX(segment[1].x)} y2={graphY(segment[1].y)} tabIndex={0} role="button" aria-label="Explore nearby coordinates on this line" onPointerMove={pointNearPointer} onPointerDown={pointNearPointer} onPointerLeave={(event) => { if (event.pointerType !== "touch") setHoverPoint(null); }} onFocus={startKeyboardExplore} onBlur={() => setHoverPoint(null)} onKeyDown={moveKeyboardPoint} />
              {table.filter((point) => Math.abs(point.y) <= graphBound).map((point) => <circle className="linear-graph-point" cx={graphX(point.x)} cy={graphY(point.y)} r="5" key={`${point.x}-${point.y}`} />)}
              {Math.abs(line.intercept) <= graphBound && <circle className="linear-graph-intercept" cx={graphX(0)} cy={graphY(line.intercept)} r="7" />}
            </g>}
            {hoverPoint && <g className="linear-graph-hover" aria-hidden="true">
              <circle cx={hoverScreenX} cy={hoverScreenY} r="6" />
              <line x1={hoverScreenX} y1={hoverScreenY} x2={hoverBoxX} y2={hoverBoxY + 15} />
              <rect x={hoverBoxX} y={hoverBoxY} width="104" height="30" rx="9" />
              <text x={hoverBoxX + 52} y={hoverBoxY + 19} textAnchor="middle">({coordinateNumber(hoverPoint.x)}, {coordinateNumber(hoverPoint.y)})</text>
            </g>}
          </svg>
          <p className="linear-graph-hover-help" aria-live="polite">{hoverPoint ? `Nearby point: (${coordinateNumber(hoverPoint.x)}, ${coordinateNumber(hoverPoint.y)})` : "Move over the blue line, tap it, or focus it and use ← → to inspect nearby coordinates."}</p>
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
