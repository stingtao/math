export type MomentumState = { current: number; best: number };

export function nextMomentumRun(state: MomentumState, cleanFirstTry: boolean): MomentumState {
  if (!cleanFirstTry) return { current: 0, best: state.best };
  const current = state.current + 1;
  return { current, best: Math.max(state.best, current) };
}
