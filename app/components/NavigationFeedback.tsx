"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export function NavigationFeedback() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    function reset() {
      delete root.dataset.navigationPending;
      document.querySelectorAll<HTMLElement>("[data-navigation-pending]").forEach((element) => {
        delete element.dataset.navigationPending;
        element.removeAttribute("aria-disabled");
        element.removeAttribute("aria-busy");
      });
      setPending(false);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noNavigationFeedback !== undefined) return;
      const url = new URL(anchor.href, window.location.href);
      if (!["http:", "https:"].includes(url.protocol)) return;
      const current = new URL(window.location.href);
      const sameDocument = url.origin === current.origin && url.pathname === current.pathname && url.search === current.search;
      if (sameDocument && url.hash) return;
      if (root.dataset.navigationPending === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      root.dataset.navigationPending = "true";
      anchor.dataset.navigationPending = "true";
      anchor.setAttribute("aria-disabled", "true");
      anchor.setAttribute("aria-busy", "true");
      flushSync(() => setPending(true));
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", reset);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", reset);
      reset();
    };
  }, []);

  return <div className={`navigation-feedback ${pending ? "active" : ""}`} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{pending && <strong>Loading…</strong>}</div>;
}
