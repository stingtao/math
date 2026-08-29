"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (response: { credential: string }) => void; use_fedcm_for_prompt?: boolean }): void;
          renderButton(element: HTMLElement, options: Record<string, string | number>): void;
        };
      };
    };
  }
}

export function GoogleSignIn({ clientId, compact = false }: { clientId: string; compact?: boolean }) {
  const buttonId = "google-sign-in-button";
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!clientId || !ageConfirmed) return;
    const render = () => {
      const element = document.getElementById(buttonId);
      if (!element || !window.google) return;
      element.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: true,
        callback: async ({ credential }) => {
          setStatus("Creating your anonymous trail…");
          const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential, ageConfirmed: true, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          });
          const body = await response.json() as { error?: string };
          if (!response.ok) setStatus(body.error ?? "Sign-in did not work. Please try again.");
          else window.location.assign("/learn");
        },
      });
      window.google.accounts.id.renderButton(element, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: compact ? 230 : 300,
      });
    };
    if (window.google) render();
    else {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) existing.addEventListener("load", render, { once: true });
      else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = render;
        document.head.appendChild(script);
      }
    }
  }, [ageConfirmed, buttonId, clientId, compact]);

  if (!clientId) {
    return (
      <div className="google-signin fallback-signin">
        <a className="primary-button" href="/learn?demo=1">Explore the learning demo <span aria-hidden="true">→</span></a>
        <span>Google sign-in activates when the production Client ID is connected.</span>
      </div>
    );
  }

  return (
    <div className="google-signin">
      <label className="age-check">
        <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} />
        <span>I confirm that I am 13 or older.</span>
      </label>
      <div className={`google-button-slot ${ageConfirmed ? "ready" : "disabled"}`} id={buttonId} aria-label="Continue with Google">
        {!ageConfirmed && <span>Confirm your age to continue</span>}
      </div>
      {status && <p className="signin-status" aria-live="polite">{status}</p>}
      <small>We never save your Google name, email, or profile photo.</small>
    </div>
  );
}
