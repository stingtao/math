"use client";

import type { ReactNode } from "react";
import { useEnterAction } from "./useEnterAction";

export function EnterActionButton({ className, disabled = false, busy = false, onClick, children }: { className?: string; disabled?: boolean; busy?: boolean; onClick: () => void; children: ReactNode }) {
  useEnterAction(onClick, !disabled && !busy);
  return <button className={className} type="button" disabled={disabled || busy} aria-busy={busy} aria-keyshortcuts="Enter" onClick={onClick}>{children}</button>;
}
