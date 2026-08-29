"use client";

import { useCallback, useEffect, useState } from "react";
import { getDemoState, type LearnerState } from "@/lib/learner-state";
import { chooseLearnerMode, type LearnerMode } from "@/lib/learner-mode";

export function useLearner(demoRequested: boolean) {
  const [state, setState] = useState<LearnerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<LearnerMode | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
      const nextMode = chooseLearnerMode(response.ok, demoRequested);
      setMode(nextMode);
      if (nextMode === "account") {
        setState(await response.json() as LearnerState);
        setError("");
      } else if (nextMode === "demo" && response.status === 401) {
        setState(getDemoState());
        setError("");
      } else {
        setState(null);
        setError(response.status === 401 ? "signin" : "We could not load your trail.");
      }
    } catch {
      setMode(null);
      setState(null);
      setError("We could not load your trail. Check your connection and try again.");
    }
    setLoading(false);
  }, [demoRequested]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { state, setState, loading, error, refresh, mode, isDemo: mode === "demo" };
}
