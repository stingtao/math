"use client";

import { useCallback, useEffect, useState } from "react";
import { getDemoState, type LearnerState } from "@/lib/learner-state";

export function useLearner(demo: boolean) {
  const [state, setState] = useState<LearnerState | null>(demo ? getDemoState() : null);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (demo) {
      setState(getDemoState());
      setLoading(false);
      return;
    }
    setLoading(true);
    const response = await fetch("/api/me", { cache: "no-store" });
    if (response.ok) {
      setState(await response.json() as LearnerState);
      setError("");
    } else {
      setError(response.status === 401 ? "signin" : "We could not load your trail.");
    }
    setLoading(false);
  }, [demo]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { state, setState, loading, error, refresh };
}
