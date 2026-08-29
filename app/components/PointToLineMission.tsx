"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
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
  const missionId = compact ? "lesson-point-line-mission" : "public-point-line-mission";
  const [phase, setPhase] = useState<"plot" | "connect" | "read" | "complete">("plot");
  const [plotted, setPlotted] = useState<CoordinatePoint[]>([]);
  const [attemptedPoint, setAttemptedPoint] = useState<CoordinatePoint | null>(null);
  const [attemptVersion, setAttemptVersion] = useState(0);
  const [readIndex, setReadIndex] = useState(0);
  const [xValue, setXValue] = useState("0");
  const [yValue, setYValue] = useState("0");
  const [feedback, setFeedback] = useState("Nova starts 1 km from base. Plot the first signal at (0, 1).");
  const activePlot = pointToLineTargets[plotted.length];
  const activeRead = coordinateReadTargets[readIndex];
  const connected = phase === "read" || phase === "complete";
  const visiblePoints = connected ? pointToLineTargets : plotted;
  const hasTrace = visiblePoints.length >= 2;
  const progress = coordinateMissionProgress(plotted.length, connected, phase === "complete" ? coordinateReadTargets.length : readIndex);

  function tryPlot(point: CoordinatePoint) {
    if (phase !== "plot" || !activePlot) return;
    setAttemptVersion((current) => current + 1);
    if (!sameCoordinate(point, activePlot)) {
      setAttemptedPoint(point);
      setFeedback(`You plotted ${pointText(point)}. The gold target is ${pointText(activePlot)}—compare the dashed x and y guides, then move your point.`);
      return;
    }
    setAttemptedPoint(null);
    const next = [...plotted, point];
    setPlotted(next);
    if (next.length === pointToLineTargets.length) {
      setPhase("connect");
      setFeedback("Every rover signal is placed. The dashed route rises 2 km each hour and starts 1 km from base.");
    } else {
      setFeedback(`${pointText(point)} is on the map.${next.length > 1 ? " The route now connects it to the previous signal." : " This is Nova’s starting distance."} Next: ${pointText(pointToLineTargets[next.length])}.`);
      setXValue("0");
      setYValue("0");
    }
  }

  function plotFromPointer(event: ReactPointerEvent<SVGSVGElement>) {
    if (phase !== "plot") return;
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return;
    const cursor = event.currentTarget.createSVGPoint();
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    const local = cursor.matrixTransform(matrix.inverse());
    const x = Math.max(0, Math.min(xMax, Math.round((local.x - plotLeft) / plotWidth * xMax)));
    const y = Math.max(0, Math.min(yMax, Math.round((plotTop + plotHeight - local.y) / plotHeight * yMax)));
    tryPlot({ x, y });
  }

  function connectPoints() {
    setPhase("read");
    setAttemptedPoint(null);
    setXValue("");
    setYValue("");
    setFeedback("The route is y = 2x + 1: 2 km farther each hour, with a 1 km head start. Now decode a signal.");
  }

  function checkReadPoint() {
    if (phase !== "read" || !activeRead) return;
    const response = { x: Number(xValue), y: Number(yValue) };
    if (!sameCoordinate(response, activeRead)) {
      setFeedback(`That reads as ${pointText(response)}. Follow the gold point down for x (hours), then across for y (kilometers).`);
      return;
    }
    const nextIndex = readIndex + 1;
    if (nextIndex === coordinateReadTargets.length) {
      setReadIndex(nextIndex);
      setPhase("complete");
      setFeedback("Mission complete: the rover story, point table, graph, and y = 2x + 1 all describe the same trip.");
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
    setAttemptedPoint(null);
    setAttemptVersion(0);
    setReadIndex(0);
    setXValue("0");
    setYValue("0");
    setFeedback("Nova starts 1 km from base. Plot the first signal at (0, 1).");
  }

  return (
    <section className={`point-line-mission ${compact ? "compact" : ""}`} aria-labelledby={`${missionId}-title`}>
      {phase === "complete" && <SuccessBurst eventKey={`${missionId}-point-line-complete`} />}
      <header className="point-line-heading">
        <div>
          <small>MARS ROVER · LINE MISSION</small>
          <strong id={`${missionId}-title`}>Track Nova with y = 2x + 1.</strong>
          <p>Nova is already 1 km from base when tracking begins. It travels 2 km farther each hour. Plot five signals, connect the route, then read one back.</p>
          <div className="point-line-model" aria-label="In y equals 2 x plus 1, x is hours and y is kilometers from base">
            <code>y = 2x + 1</code><span><b>2</b> km each hour</span><span><b>+1</b> km at the start</span>
          </div>
        </div>
        <div className="point-line-charge" role="progressbar" aria-label={`Mission progress: ${progress} percent`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span><i style={{ width: `${progress}%` }} /></span><b>{progress}%</b><small>PROGRESS</small></div>
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
            <title id={`${missionId}-graph-title`}>Interactive rover coordinate plane for y equals 2x plus 1</title>
            <desc id={`${missionId}-graph-description`}>{phase === "plot" && activePlot ? attemptedPoint ? `The attempted point ${pointText(attemptedPoint)} is shown in coral and the target ${pointText(activePlot)} is shown as a gold ring.` : `Plot ${pointText(activePlot)} by tapping the grid, or use the coordinate controls beside the graph.` : connected ? "The connected rover route y equals 2x plus 1 with five integer points." : "All required rover signals are plotted and ready to connect."}</desc>
            <rect className="point-line-paper" x={plotLeft} y={plotTop} width={plotWidth} height={plotHeight} rx="10" />
            {xTicks.map((tick) => <line className="point-line-grid" x1={graphX(tick)} y1={plotTop} x2={graphX(tick)} y2={plotTop + plotHeight} key={`x-${tick}`} />)}
            {yTicks.map((tick) => <line className="point-line-grid" x1={plotLeft} y1={graphY(tick)} x2={plotLeft + plotWidth} y2={graphY(tick)} key={`y-${tick}`} />)}
            <line className="point-line-axis" x1={plotLeft} y1={graphY(0)} x2={plotLeft + plotWidth + 5} y2={graphY(0)} />
            <line className="point-line-axis" x1={graphX(0)} y1={plotTop - 5} x2={graphX(0)} y2={plotTop + plotHeight} />
            {xTicks.map((tick) => <text className="point-line-label" x={graphX(tick)} y={plotTop + plotHeight + 22} textAnchor="middle" key={`xl-${tick}`}>{tick}</text>)}
            {yTicks.filter((tick) => tick > 0 && tick % 2 === 0).map((tick) => <text className="point-line-label" x={plotLeft - 12} y={graphY(tick) + 4} textAnchor="end" key={`yl-${tick}`}>{tick}</text>)}
            <text className="point-line-axis-name" x={plotLeft + plotWidth - 6} y={plotTop + plotHeight - 10} textAnchor="end">hours · x</text>
            <text className="point-line-axis-name" x={plotLeft + 9} y={plotTop + 15}>km · y</text>
            {hasTrace && <polyline className={`point-line-connection ${connected ? "confirmed" : "progressive"}`} points={visiblePoints.map((point) => `${graphX(point.x)},${graphY(point.y)}`).join(" ")} />}
            {attemptedPoint && activePlot && <g key={`attempt-${attemptVersion}`} className="point-line-attempt">
              <line className="point-line-attempt-guide" x1={graphX(attemptedPoint.x)} y1={graphY(0)} x2={graphX(attemptedPoint.x)} y2={graphY(attemptedPoint.y)} />
              <line className="point-line-attempt-guide" x1={graphX(0)} y1={graphY(attemptedPoint.y)} x2={graphX(attemptedPoint.x)} y2={graphY(attemptedPoint.y)} />
              <circle className="point-line-target-ring" cx={graphX(activePlot.x)} cy={graphY(activePlot.y)} r="13" />
              <text className="point-line-target-label" x={graphX(activePlot.x) + 16} y={graphY(activePlot.y) - 12}>target {pointText(activePlot)}</text>
              <circle className="point-line-attempt-dot" cx={graphX(attemptedPoint.x)} cy={graphY(attemptedPoint.y)} r="10" />
              <path className="point-line-attempt-cross" d={`M ${graphX(attemptedPoint.x) - 4} ${graphY(attemptedPoint.y) - 4} L ${graphX(attemptedPoint.x) + 4} ${graphY(attemptedPoint.y) + 4} M ${graphX(attemptedPoint.x) + 4} ${graphY(attemptedPoint.y) - 4} L ${graphX(attemptedPoint.x) - 4} ${graphY(attemptedPoint.y) + 4}`} />
              <text className="point-line-attempt-label" x={graphX(attemptedPoint.x)} y={graphY(attemptedPoint.y) - 16} textAnchor="middle">you {pointText(attemptedPoint)}</text>
            </g>}
            {visiblePoints.map((point, index) => {
              const highlighted = phase === "read" && activeRead && sameCoordinate(point, activeRead);
              const showCoordinate = phase === "plot" || phase === "connect";
              const labelX = point.x === 0 ? graphX(point.x) + 13 : graphX(point.x);
              return <g key={`${point.x}-${point.y}`} className={highlighted ? "point-line-marker highlighted" : "point-line-marker"}>
                <circle className="point-line-marker-halo" cx={graphX(point.x)} cy={graphY(point.y)} r={highlighted ? 16 : 14} />
                <circle className="point-line-marker-dot" cx={graphX(point.x)} cy={graphY(point.y)} r={highlighted ? 10 : 8} />
                <text className="point-line-marker-index" x={graphX(point.x)} y={graphY(point.y) + 5} textAnchor="middle">{highlighted ? "?" : index + 1}</text>
                <text className="point-line-marker-coordinate" x={labelX} y={graphY(point.y) - 16} textAnchor={point.x === 0 ? "start" : "middle"}>{showCoordinate ? pointText(point) : highlighted ? "Find (x, y)" : ""}</text>
              </g>;
            })}
          </svg>
          <p>{attemptedPoint ? "Coral is your point. Gold is the target. Dashed guides show its x and y." : "x is time in hours. y is Nova’s distance from base in kilometers."}</p>
        </div>

        <aside className="point-line-task">
          {phase === "plot" && activePlot && <>
            <span className="point-line-kicker">POINT {plotted.length + 1} OF {pointToLineTargets.length}</span>
            <h3>Plot <code>{pointText(activePlot)}</code></h3>
            <p>At hour <strong>{activePlot.x}</strong>, Nova is <strong>{activePlot.y} km</strong> from base.</p>
            <div className="point-line-coordinate-inputs">
              <label><span>x</span><select value={xValue} onChange={(event) => setXValue(event.target.value)}>{xTicks.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>y</span><select value={yValue} onChange={(event) => setYValue(event.target.value)}>{yTicks.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>
            <button className="primary-button" type="button" onClick={() => tryPlot({ x: Number(xValue), y: Number(yValue) })}>Plot this point <span aria-hidden="true">→</span></button>
          </>}
          {phase === "connect" && <>
            <span className="point-line-kicker">PATTERN FOUND</span>
            <h3>Five signals are ready.</h3>
            <p>Each hour adds 2 km. The trip began at 1 km. Connect the points to reveal the route.</p>
            <button className="primary-button" type="button" onClick={connectPoints}>Connect my points <span aria-hidden="true">↗</span></button>
          </>}
          {phase === "read" && activeRead && <>
            <span className="point-line-kicker">DECODE {readIndex + 1} OF {coordinateReadTargets.length}</span>
            <h3>Decode the gold signal.</h3>
            <p>Read hours on x and kilometers from base on y.</p>
            <div className="point-line-coordinate-inputs read-inputs">
              <label><span>x</span><input aria-label="x coordinate" value={xValue} inputMode="numeric" onChange={(event) => setXValue(event.target.value)} /></label>
              <label><span>y</span><input aria-label="y coordinate" value={yValue} inputMode="numeric" onChange={(event) => setYValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") checkReadPoint(); }} /></label>
            </div>
            <button className="primary-button" type="button" disabled={xValue === "" || yValue === ""} onClick={checkReadPoint}>Check coordinate <span aria-hidden="true">→</span></button>
          </>}
          {phase === "complete" && <>
            <span className="point-line-kicker">MISSION COMPLETE · +1 SKILL</span>
            <h3>Nova’s route is decoded.</h3>
            <p>Five signals became y = 2x + 1, and you translated the graph back into the trip.</p>
            <button className="secondary-button" type="button" onClick={resetMission}>Play again <span aria-hidden="true">↻</span></button>
          </>}
          <div className={`point-line-feedback ${phase === "complete" ? "complete" : attemptedPoint ? "incorrect" : ""}`} role="status" aria-live="polite"><span aria-hidden="true">{phase === "complete" ? "✓" : attemptedPoint ? "↙" : "◇"}</span><p>{feedback}</p></div>
        </aside>
      </div>
    </section>
  );
}
