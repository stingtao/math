export type CoordinatePoint = { x: number; y: number };

export const pointToLineTargets: CoordinatePoint[] = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 7 },
  { x: 4, y: 9 },
];

export const coordinateReadTargets: CoordinatePoint[] = [
  { x: 1, y: 3 },
  { x: 3, y: 7 },
  { x: 4, y: 9 },
];

export function sameCoordinate(left: CoordinatePoint, right: CoordinatePoint) {
  return left.x === right.x && left.y === right.y;
}

export function isOnRoverLine(point: CoordinatePoint) {
  return point.y === 2 * point.x + 1;
}

export function coordinateMissionProgress(plotted: number, connected: boolean, read: number) {
  const completedActions = Math.min(pointToLineTargets.length, plotted) + (connected ? 1 : 0) + Math.min(coordinateReadTargets.length, read);
  return Math.round(completedActions / (pointToLineTargets.length + coordinateReadTargets.length + 1) * 100);
}
