export type NavigationViewportIntent =
  | "external"
  | "forward-hash"
  | "forward-top"
  | "same-document-hash"
  | "same-document-top";

export function navigationViewportIntent(currentHref: string, targetHref: string): NavigationViewportIntent {
  const current = new URL(currentHref);
  const target = new URL(targetHref, current);
  if (!["http:", "https:"].includes(target.protocol) || target.origin !== current.origin) return "external";

  const sameDocument = target.pathname === current.pathname && target.search === current.search;
  if (sameDocument) return target.hash ? "same-document-hash" : "same-document-top";
  return target.hash ? "forward-hash" : "forward-top";
}
