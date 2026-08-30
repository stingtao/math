"use client";

import { useEffect, useRef, useState } from "react";
import { FAMILY_ACCOUNT_RETENTION_MONTHS, FAMILY_AGREEMENT_VERSION, FAMILY_DATA_RETENTION_MONTHS, FAMILY_STORAGE_SUMMARY } from "@/lib/family-policy";

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
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const authPending = useRef(false);
  const parentConfirmedRef = useRef(false);

  useEffect(() => {
    if (!clientId || !parentConfirmed) return;
    const render = () => {
      const button = document.getElementById(buttonId);
      if (!button || !window.google || !parentConfirmedRef.current) return;
      button.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: true,
        callback: async ({ credential }) => {
          if (!parentConfirmedRef.current) {
            setStatus("Confirm the family learning agreement before signing in.");
            return;
          }
          if (authPending.current) return;
          authPending.current = true;
          setStatus("Opening your private family learning space…");
          button.setAttribute("aria-busy", "true");
          button.style.pointerEvents = "none";
          try {
            const response = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential, parentConfirmed: true, agreementVersion: FAMILY_AGREEMENT_VERSION, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
            });
            const body = await response.json() as { error?: string };
            if (!response.ok) {
              setStatus(body.error ?? "Sign-in did not work. Please try again.");
              authPending.current = false;
              button.removeAttribute("aria-busy");
              button.style.pointerEvents = "";
            } else window.location.assign("/learn");
          } catch {
            setStatus("Sign-in did not work. Check your connection and try again.");
            authPending.current = false;
            button.removeAttribute("aria-busy");
            button.style.pointerEvents = "";
          }
        },
      });
      window.google.accounts.id.renderButton(button, {
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
  }, [parentConfirmed, buttonId, clientId, compact]);

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
      <section className="parent-consent-summary" aria-labelledby="parent-consent-heading">
        <strong id="parent-consent-heading">What the parent account saves on Cloudflare D1</strong>
        <ul>{FAMILY_STORAGE_SUMMARY.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>If you do not sign in again, saved family data is automatically deleted after {FAMILY_DATA_RETENTION_MONTHS} months and the remaining account record after {FAMILY_ACCOUNT_RETENTION_MONTHS} months. Every successful parent sign-in restarts both periods. You can delete categories or the complete account sooner from Family space.</p>
      </section>
      <label className="age-check">
        <input type="checkbox" checked={parentConfirmed} onChange={(event) => { parentConfirmedRef.current = event.target.checked; setParentConfirmed(event.target.checked); }} />
        <span>I am 18 or older and the parent or legal guardian. I consent to the storage, visibility, retention, and deletion terms described above and in the linked notices, and I will stay with my child during learning.</span>
      </label>
      <p className="parent-account-note">The account belongs to you. Your child does not sign in. Math saves one shared family learning record and does not ask for a child’s name, email, birth date, school, photo, or voice.</p>
      {parentConfirmed
        ? <div className="google-button-slot ready" id={buttonId} key="ready" aria-label="Continue with Google as a parent" />
        : <div className="google-button-slot disabled" key="disabled" aria-label="Parent confirmation required" aria-disabled="true"><span>Confirm your parent role to continue</span></div>}
      {status && <p className="signin-status" aria-live="polite">{status}</p>}
      <small>We never save your Google name, email, or profile photo. Read the <a href="/privacy">family privacy notice</a> and <a href="/terms">family terms</a>.</small>
    </div>
  );
}
