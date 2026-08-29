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
  const visiblePoints = connected ? pointToLineTargets : plotted;
  const hasTrace = visiblePoints.length >= 2;
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
      setFeedback("Every point is placed. The dashed trace shows the path from point to point. Confirm it to reveal the full relationship.");
    } else {
      setFeedback(`${pointText(point)} is locked in.${next.length > 1 ? " It is now connected to the previous point." : " The point is highlighted on the graph."} Next, plot ${pointText(pointToLineTargets[next.length])}.`);
      setXValue(String(pointToLineTargets[next.length].x));
      setYValue(String(pointToLineTargets[next.length].y));
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
        <div><small>GRAPH MISSION · THREE MOVES</small><strong id={`${missionId}-title`}>Plot. Connect. Decode.</strong><p>Build one line from coordinates, then prove you can read it.</p></div>
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
            {hasTrace && <polyline className={`point-line-connection ${connected ? "confirmed" : "progressive"}`} points={visiblePoints.map((point) => `${graphX(point.x)},${graphY(point.y)}`).join(" ")} />}
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
          <p>Each point gets a number and coordinate label. The dashed route grows after every correct plot.</p>
        </div>

        <aside className="point-line-task">
          {phase === "plot" && activePlot && <>
            <span className="point-line-kicker">POINT {plotted.length + 1} OF {pointToLineTargets.length}</span>
            <h3>Plot <code>{pointText(activePlot)}</code></h3>
            <p>Move <strong>{activePlot.x}</strong> across the x-axis, then <strong>{activePlot.y}</strong> on the y-axis.</p>
            <div className="point-line-coordinate-inputs">
              <label><span>x</span><select value={xValue} onChange={(event) => setXValue(event.target.value)}>{xTicks.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>y</span><select value={yValue} onChange={(event) => setYValue(event.target.value)}>{yTicks.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>
            <button className="primary-button" type="button" onClick={() => tryPlot({ x: Number(xValue), y: Number(yValue) })}>Plot this point <span aria-hidden="true">→</span></button>
          </>}
          {phase === "connect" && <>
            <span className="point-line-kicker">PATTERN FOUND</span>
            <h3>Five points are ready.</h3>
            <p>When x increases by 1, y increases by 2. Connect the route to reveal the line.</p>
            <button className="primary-button" type="button" onClick={connectPoints}>Connect my points <span aria-hidden="true">↗</span></button>
          </>}
          {phase === "read" && activeRead && <>
            <span className="point-line-kicker">DECODE {readIndex + 1} OF {coordinateReadTargets.length}</span>
            <h3>Read the gold point.</h3>
            <p>Trace to each axis, then enter the ordered pair.</p>
            <div className="point-line-coordinate-inputs read-inputs">
              <label><span>x</span><input aria-label="x coordinate" value={xValue} inputMode="numeric" onChange={(event) => setXValue(event.target.value)} /></label>
              <label><span>y</span><input aria-label="y coordinate" value={yValue} inputMode="numeric" onChange={(event) => setYValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") checkReadPoint(); }} /></label>
            </div>
            <button className="primary-button" type="button" disabled={xValue === "" || yValue === ""} onClick={checkReadPoint}>Check coordinate <span aria-hidden="true">→</span></button>
          </>}
          {phase === "complete" && <>
            <span className="point-line-kicker">MISSION COMPLETE · +1 SKILL</span>
            <h3>You built and decoded the line.</h3>
            <p>Five points became y = 2x, and you read three coordinates back from it.</p>
            <button className="secondary-button" type="button" onClick={resetMission}>Play again <span aria-hidden="true">↻</span></button>
          </>}
          <div className={`point-line-feedback ${phase === "complete" ? "complete" : ""}`} role="status" aria-live="polite"><span aria-hidden="true">{phase === "complete" ? "✓" : "◇"}</span><p>{feedback}</p></div>
        </aside>
      </div>

      <footer><span aria-hidden="true">◇</span><p><strong>Private practice.</strong> Your taps and coordinates stay in this browser tab and are never saved or tied to an identity.</p></footer>
    </section>
  );
}
