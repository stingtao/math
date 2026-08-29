"use client";

import { useEffect, useRef } from "react";

export function useEnterAction(action: () => void | Promise<void>, enabled = true) {
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    if (!enabled) return;

    function handleEnter(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("button, a, input, select, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      void actionRef.current();
    }

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [enabled]);
}
