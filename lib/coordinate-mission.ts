export type CoordinatePoint = { x: number; y: number };

export const pointToLineTargets: CoordinatePoint[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
  { x: 4, y: 8 },
];

export const coordinateReadTargets: CoordinatePoint[] = [
  { x: 1, y: 2 },
  { x: 3, y: 6 },
  { x: 4, y: 8 },
];

export function sameCoordinate(left: CoordinatePoint, right: CoordinatePoint) {
  return left.x === right.x && left.y === right.y;
}

export function isOnDoubleLine(point: CoordinatePoint) {
  return point.y === 2 * point.x;
}

export function coordinateMissionProgress(plotted: number, connected: boolean, read: number) {
  const completedActions = Math.min(pointToLineTargets.length, plotted) + (connected ? 1 : 0) + Math.min(coordinateReadTargets.length, read);
  return Math.round(completedActions / (pointToLineTargets.length + coordinateReadTargets.length + 1) * 100);
}
