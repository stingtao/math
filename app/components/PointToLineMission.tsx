"use client";

import { useId, useState, type PointerEvent as ReactPointerEvent } from "react";
import { coordinateMissionProgress, coordinateReadTargets, pointToLineTargets, sameCoordinate, type CoordinatePoint } from "@/lib/coordinate-mission";
import { SuccessBurst } from "./SuccessBurst";

const viewWidth = 372;
const viewHeight = 342;
const plotLeft = 48;
const plotTop = 18;
const plotWidth = 294;
const plotHeight = 280;
const xMax = 5;
const yMax = 10;
const xTicks = Array.from({ length: xMax + 1 }, (_, index) => index);
const yTicks = Array.from({ length: yMax + 1 }, (_, index) => index);

function graphX(value: number) {
  return plotLeft + value / xMax * plotWidth;
}

function graphY(value: number) {
  return plotTop + plotHeight - value / yMax * plotHeight;
}

function pointText(point: CoordinatePoint) {
  return `(${point.x}, ${point.y})`;
}

export function PointToLineMission({ compact = false }: { compact?: boolean }) {
  const missionId = useId();
  const [phase, setPhase] = useState<"plot" | "connect" | "read" | "complete">("plot");
  const [plotted, setPlotted] = useState<CoordinatePoint[]>([]);
  const [readIndex, setReadIndex] = useState(0);
  const [xValue, setXValue] = useState("0");
  const [yValue, setYValue] = useState("0");
  const [feedback, setFeedback] = useState("Start at the origin. Move across for x, then up for y.");
  const activePlot = pointToLineTargets[plotted.length];
  const activeRead = coordinateReadTargets[readIndex];
  const connected = phase === "read" || phase === "complete";
  const progress = coordinateMissionProgress(plotted.length, connected, phase === "complete" ? coordinateReadTargets.length : readIndex);

  function tryPlot(point: CoordinatePoint) {
    if (phase !== "plot" || !activePlot) return;
    if (!sameCoordinate(point, activePlot)) {
      setFeedback(`That spot is ${pointText(point)}. Remember: x moves across first, then y moves up.`);
      return;
    }
    const next = [...plotted, point];
    setPlotted(next);
    if (next.length === pointToLineTargets.length) {
      setPhase("connect");
      setFeedback("Every point is placed. Now connect them and look for the rule.");
    } else {
      setFeedback(`${pointText(point)} is locked in. Next, plot ${pointText(pointToLineTargets[next.length])}.`);
      setXValue(String(pointToLineTargets[next.length].x));
      setYValue(String(pointToLineTargets[next.length].y));
    }
  }

  function plotFromPointer(event: ReactPointerEvent<SVGSVGElement>) {
    if (phase !== "plot") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = (event.clientX - bounds.left) * viewWidth / bounds.width;
    const localY = (event.clientY - bounds.top) * viewHeight / bounds.height;
    const x = Math.max(0, Math.min(xMax, Math.round((localX - plotLeft) / plotWidth * xMax)));
    const y = Math.max(0, Math.min(yMax, Math.round((plotTop + plotHeight - localY) / plotHeight * yMax)));
    tryPlot({ x, y });
  }

  function connectPoints() {
    setPhase("read");
    setXValue("");
    setYValue("");
    setFeedback(`The points form y = 2x. Now read the highlighted point from the finished line.`);
  }

  function checkReadPoint() {
    if (phase !== "read" || !activeRead) return;
    const response = { x: Number(xValue), y: Number(yValue) };
    if (!sameCoordinate(response, activeRead)) {
      setFeedback("Look down to the x-axis first, then across to the y-axis. Write x before y.");
      return;
    }
    const nextIndex = readIndex + 1;
    if (nextIndex === coordinateReadTargets.length) {
      setReadIndex(nextIndex);
      setPhase("complete");
      setFeedback("Mission complete: a table of matching points, a graph, and y = 2x all describe the same relationship.");
      return;
    }
    setReadIndex(nextIndex);
    setXValue("");
    setYValue("");
    setFeedback(`${pointText(activeRead)} decoded. Read the next highlighted point.`);
  }

  function resetMission() {
    setPhase("plot");
    setPlotted([]);
    setReadIndex(0);
    setXValue("0");
    setYValue("0");
    setFeedback("Start at the origin. Move across for x, then up for y.");
  }

  return (
    <section className={`point-line-mission ${compact ? "compact" : ""}`} aria-labelledby={`${missionId}-title`}>
      {phase === "complete" && <SuccessBurst eventKey={`${missionId}-point-line-complete`} />}
      <header className="point-line-heading">
        <div><small>GRAPH TRAIL · 2-PART MISSION</small><strong id={`${missionId}-title`}>Turn points into a line. Then decode the line.</strong><p>Place coordinates in order, connect the pattern, and read coordinates back from the finished graph.</p></div>
        <div className="point-line-charge" aria-label={`Mission charge ${progress} percent`}><span><i style={{ width: `${progress}%` }} /></span><b>{progress}%</b><small>SKILL CHARGE</small></div>
      </header>

      <div className="point-line-phases" aria-label="Mission stages">
        <span className={phase === "plot" ? "active" : plotted.length === pointToLineTargets.length ? "done" : ""}><b>{plotted.length === pointToLineTargets.length ? "✓" : "1"}</b>Plot points</span>
        <i aria-hidden="true" />
        <span className={phase === "connect" ? "active" : connected ? "done" : ""}><b>{connected ? "✓" : "2"}</b>Connect</span>
        <i aria-hidden="true" />
        <span className={phase === "read" ? "active" : phase === "complete" ? "done" : ""}><b>{phase === "complete" ? "✓" : "3"}</b>Read (x, y)</span>
      </div>

      <div className="point-line-workspace">
        <div className="point-line-graph">
          <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} onPointerDown={plotFromPointer} role="img" aria-labelledby={`${missionId}-graph-title ${missionId}-graph-description`}>
            <title id={`${missionId}-graph-title`}>Interactive coordinate plane for the line y equals 2x</title>
            <desc id={`${missionId}-graph-description`}>{phase === "plot" && activePlot ? `Plot ${pointText(activePlot)} by tapping the grid, or use the coordinate controls beside the graph.` : connected ? "The connected line y equals 2x with integer points from zero zero through four eight." : "All required points are plotted and ready to connect."}</desc>
            <rect className="point-line-paper" x={plotLeft} y={plotTop} width={plotWidth} height={plotHeight} rx="10" />
            {xTicks.map((tick) => <line className="point-line-grid" x1={graphX(tick)} y1={plotTop} x2={graphX(tick)} y2={plotTop + plotHeight} key={`x-${tick}`} />)}
            {yTicks.map((tick) => <line className="point-line-grid" x1={plotLeft} y1={graphY(tick)} x2={plotLeft + plotWidth} y2={graphY(tick)} key={`y-${tick}`} />)}
            <line className="point-line-axis" x1={plotLeft} y1={graphY(0)} x2={plotLeft + plotWidth + 5} y2={graphY(0)} />
            <line className="point-line-axis" x1={graphX(0)} y1={plotTop - 5} x2={graphX(0)} y2={plotTop + plotHeight} />
            {xTicks.map((tick) => <text className="point-line-label" x={graphX(tick)} y={plotTop + plotHeight + 22} textAnchor="middle" key={`xl-${tick}`}>{tick}</text>)}
            {yTicks.filter((tick) => tick > 0 && tick % 2 === 0).map((tick) => <text className="point-line-label" x={plotLeft - 12} y={graphY(tick) + 4} textAnchor="end" key={`yl-${tick}`}>{tick}</text>)}
            <text className="point-line-axis-name" x={plotLeft + plotWidth - 4} y={plotTop + plotHeight - 10}>x</text>
            <text className="point-line-axis-name" x={plotLeft + 10} y={plotTop + 15}>y</text>
            {connected && <polyline className="point-line-connection" points={pointToLineTargets.map((point) => `${graphX(point.x)},${graphY(point.y)}`).join(" ")} />}
            {(connected ? pointToLineTargets : plotted).map((point) => {
              const highlighted = phase === "read" && activeRead && sameCoordinate(point, activeRead);
              return <g key={`${point.x}-${point.y}`} className={highlighted ? "point-line-marker highlighted" : "point-line-marker"}><circle cx={graphX(point.x)} cy={graphY(point.y)} r={highlighted ? 10 : 7} /><text x={graphX(point.x)} y={graphY(point.y) - 14} textAnchor="middle">{highlighted ? "?" : ""}</text></g>;
            })}
          </svg>
          <p>Tap an intersection to plot. Keyboard users can enter the same coordinate with the controls.</p>
        </div>

        <aside className="point-line-task">
          {phase === "plot" && activePlot && <>
            <span className="point-line-kicker">POINT {plotted.length + 1} OF {pointToLineTargets.length}</span>
            <h3>Plot <code>{pointText(activePlot)}</code></h3>
            <p>Move <strong>{activePlot.x}</strong> across on x, then <strong>{activePlot.y}</strong> up on y.</p>
            <div className="point-line-coordinate-inputs">
              <label><span>x</span><select value={xValue} onChange={(event) => setXValue(event.target.value)}>{xTicks.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>y</span><select value={yValue} onChange={(event) => setYValue(event.target.value)}>{yTicks.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>
            <button className="primary-button" type="button" onClick={() => tryPlot({ x: Number(xValue), y: Number(yValue) })}>Plot this point <span aria-hidden="true">→</span></button>
          </>}
          {phase === "connect" && <>
            <span className="point-line-kicker">PATTERN FOUND</span>
            <h3>Five points are ready.</h3>
            <p>Each time x grows by 1, y grows by 2. Connect them to reveal one straight relationship.</p>
            <button className="primary-button" type="button" onClick={connectPoints}>Connect my points <span aria-hidden="true">↗</span></button>
          </>}
          {phase === "read" && activeRead && <>
            <span className="point-line-kicker">DECODE {readIndex + 1} OF {coordinateReadTargets.length}</span>
            <h3>Read the gold point.</h3>
            <p>Trace down for x and left for y. Enter the ordered pair.</p>
            <div className="point-line-coordinate-inputs read-inputs">
              <label><span>x</span><input aria-label="x coordinate" value={xValue} inputMode="numeric" onChange={(event) => setXValue(event.target.value)} /></label>
              <label><span>y</span><input aria-label="y coordinate" value={yValue} inputMode="numeric" onChange={(event) => setYValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") checkReadPoint(); }} /></label>
            </div>
            <button className="primary-button" type="button" disabled={xValue === "" || yValue === ""} onClick={checkReadPoint}>Check coordinate <span aria-hidden="true">→</span></button>
          </>}
          {phase === "complete" && <>
            <span className="point-line-kicker">MISSION COMPLETE · +1 SKILL</span>
            <h3>Points, line, rule—connected.</h3>
            <p>You built y = 2x from points and decoded three coordinates from the finished line.</p>
            <button className="secondary-button" type="button" onClick={resetMission}>Play again <span aria-hidden="true">↻</span></button>
          </>}
          <div className={`point-line-feedback ${phase === "complete" ? "complete" : ""}`} role="status" aria-live="polite"><span aria-hidden="true">{phase === "complete" ? "✓" : "◇"}</span><p>{feedback}</p></div>
        </aside>
      </div>

      <footer><span aria-hidden="true">◇</span><p><strong>Private practice.</strong> Your taps and coordinates stay in this browser tab and are never saved or tied to an identity.</p></footer>
    </section>
  );
}
