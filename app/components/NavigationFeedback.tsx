"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { navigationViewportIntent, type NavigationViewportIntent } from "@/lib/navigation-viewport";
import { resetRouteViewport } from "./useContentStart";

const forwardNavigationKey = "math-forward-navigation";

export function NavigationFeedback() {
  const [pending, setPending] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const previousRouteKey = useRef(routeKey);
  const viewportIntent = useRef<NavigationViewportIntent | null>(null);

  const reset = useCallback(() => {
    const root = document.documentElement;
    delete root.dataset.navigationPending;
    document.querySelectorAll<HTMLElement>("[data-navigation-pending]").forEach((element) => {
      delete element.dataset.navigationPending;
      element.removeAttribute("aria-disabled");
      element.removeAttribute("aria-busy");
    });
    setPending(false);
  }, []);

  const forgetForwardNavigation = useCallback(() => {
    try { window.sessionStorage.removeItem(forwardNavigationKey); } catch { /* Session storage is optional. */ }
  }, []);

  useEffect(() => {
    let target = "";
    try { target = window.sessionStorage.getItem(forwardNavigationKey) ?? ""; } catch { /* Session storage is optional. */ }
    forgetForwardNavigation();
    if (target !== `${window.location.pathname}${window.location.search}`) return;
    const frame = window.requestAnimationFrame(resetRouteViewport);
    return () => window.cancelAnimationFrame(frame);
  }, [forgetForwardNavigation]);

  useEffect(() => {
    if (previousRouteKey.current === routeKey) return;
    previousRouteKey.current = routeKey;
    const shouldResetViewport = viewportIntent.current === "forward-top";
    viewportIntent.current = null;
    forgetForwardNavigation();
    reset();
    if (!shouldResetViewport) return;
    const frame = window.requestAnimationFrame(resetRouteViewport);
    return () => window.cancelAnimationFrame(frame);
  }, [forgetForwardNavigation, reset, routeKey]);

  useEffect(() => {
    const root = document.documentElement;

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noNavigationFeedback !== undefined) return;
      const url = new URL(anchor.href, window.location.href);
      if (!["http:", "https:"].includes(url.protocol)) return;
      const intent = navigationViewportIntent(window.location.href, url.href);
      if (intent === "same-document-hash") return;
      if (intent === "same-document-top") {
        event.preventDefault();
        resetRouteViewport();
        return;
      }
      if (root.dataset.navigationPending === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      viewportIntent.current = intent;
      if (intent === "forward-top") {
        try { window.sessionStorage.setItem(forwardNavigationKey, `${url.pathname}${url.search}`); } catch { /* Session storage is optional. */ }
      }
      root.dataset.navigationPending = "true";
      anchor.dataset.navigationPending = "true";
      anchor.setAttribute("aria-disabled", "true");
      anchor.setAttribute("aria-busy", "true");
      flushSync(() => setPending(true));
    }

    function restoreHistoryPosition() {
      viewportIntent.current = null;
      forgetForwardNavigation();
      reset();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", restoreHistoryPosition);
    window.addEventListener("popstate", restoreHistoryPosition);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", restoreHistoryPosition);
      window.removeEventListener("popstate", restoreHistoryPosition);
      reset();
    };
  }, [forgetForwardNavigation, reset]);

  return <div className={`navigation-feedback ${pending ? "active" : ""}`} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{pending && <strong>Loading…</strong>}</div>;
}
