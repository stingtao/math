"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export type ProgressDetail = {
  eyebrow: string;
  title: string;
  status: string;
  description: string;
  glyph: string;
  tone?: "blue" | "teal" | "coral" | "violet" | "gold";
  facts: Array<{ label: string; value: string }>;
  actionHref?: string;
  actionLabel?: string;
  visual?: ReactNode;
};

export function ProgressDetailModal({ detail, onClose }: { detail: ProgressDetail; onClose: () => void }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]:not([aria-disabled="true"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="progress-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`progress-detail-modal accent-${detail.tone ?? "blue"}`} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close details">×</button>
        <div className="progress-detail-heading">
          <div className="progress-detail-glyph" aria-hidden="true">{detail.visual ?? detail.glyph}</div>
          <div><span className="section-kicker">{detail.eyebrow}</span><h2 id={titleId}>{detail.title}</h2><strong>{detail.status}</strong></div>
        </div>
        <p id={descriptionId}>{detail.description}</p>
        <dl>{detail.facts.map((fact) => <div key={`${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        <div className="progress-detail-actions">
          {detail.actionHref && detail.actionLabel && <a className="primary-button" href={detail.actionHref}>{detail.actionLabel} <span aria-hidden="true">→</span></a>}
          <button className="secondary-button" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
