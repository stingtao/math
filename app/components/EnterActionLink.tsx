"use client";

import { useRef, type ReactNode } from "react";
import { useEnterAction } from "./useEnterAction";

export function EnterActionLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEnterAction(() => linkRef.current?.click());

  return <a ref={linkRef} className={className} href={href} aria-keyshortcuts="Enter">{children}</a>;
}
