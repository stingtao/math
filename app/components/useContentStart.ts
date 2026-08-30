"use client";

import { useEffect, useRef, type RefObject } from "react";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function revealContentStart(element: HTMLElement) {
  const focusTarget = element.querySelector<HTMLElement>("[data-learning-heading]") ?? element.querySelector<HTMLElement>("h1, h2, h3, [role='heading']") ?? element;
  if (!focusTarget.hasAttribute("tabindex")) focusTarget.tabIndex = -1;
  focusTarget.focus({ preventScroll: true });
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
    inline: "nearest",
  });
}

export function resetRouteViewport() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  root.style.scrollBehavior = previousBehavior;

  const pageStart = document.querySelector<HTMLElement>(".page-content main h1") ?? document.querySelector<HTMLElement>(".page-content");
  if (pageStart) {
    pageStart.tabIndex = -1;
    pageStart.focus({ preventScroll: true });
  }
}

export function useContentStart<T extends HTMLElement>(transitionKey: string): RefObject<T | null> {
  const targetRef = useRef<T>(null);
  const previousKey = useRef(transitionKey);

  useEffect(() => {
    if (previousKey.current === transitionKey) return;
    previousKey.current = transitionKey;
    let frame = 0;
    let observer: MutationObserver | null = null;

    function revealWhenAvailable() {
      const target = targetRef.current;
      if (!target) return;
      const modal = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      if (modal && !modal.contains(target)) {
        observer = new MutationObserver(() => {
          if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
          observer?.disconnect();
          observer = null;
          frame = window.requestAnimationFrame(revealWhenAvailable);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return;
      }
      revealContentStart(target);
    }

    frame = window.requestAnimationFrame(revealWhenAvailable);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [transitionKey]);

  return targetRef;
}
