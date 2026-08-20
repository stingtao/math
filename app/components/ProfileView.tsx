"use client";

import { useEffect, useState } from "react";
import { saveDemoState, type LearnerState } from "@/lib/learner-state";
import { Avatar } from "./Avatar";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";

const frames = [
  { id: "halo", label: "Soft Halo", cost: 30 },
  { id: "summit", label: "Summit Ring", cost: 60 },
  { id: "prism", label: "Prism Frame", cost: 90 },
];

export function ProfileView({ demo, clientId }: { demo: boolean; clientId: string }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (loading) return <main className="loading-page" role="status"><div className="loading-mark">✦</div><p>Opening your anonymous profile…</p></main>;
  if (!state || error) return <main className="auth-gate"><div className="auth-card"><span className="auth-orbit">✦</span><h1>Sign in to view your profile.</h1><a className="primary-button" href="/#join">Continue with Google <span>→</span></a></div></main>;
  const activeState = state;

  async function action(payload: Record<string, unknown>) {
    if (demo) return null;
    const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify(payload) });
    const body = await response.json() as { state?: LearnerState; error?: string };
    if (body.state) setState(body.state);
    setMessage(response.ok ? "Saved." : body.error ?? "That change could not be saved.");
    return response.ok;
  }

  async function reroll() {
    if (demo) {
      if (activeState.profile.rerollUsed) { setMessage("Your free identity reroll has already been used."); return; }
      const next: LearnerState = { ...activeState, profile: { ...activeState.profile, nickname: "NimbleOrbit731", avatar: { ...activeState.profile.avatar, glyph: "orbit", tone: "violet" }, rerollUsed: true } };
      saveDemoState(next); setState(next); setMessage("Your new anonymous identity is ready."); return;
    }
    await action({ action: "reroll" });
  }

  async function toggleLeaderboard() {
    const enabled = !activeState.profile.leaderboardOptIn;
    if (demo) {
      const next: LearnerState = { ...activeState, profile: { ...activeState.profile, leaderboardOptIn: enabled } };
      saveDemoState(next); setState(next); setMessage(enabled ? "You joined the anonymous weekly league." : "You left the public league."); return;
    }
    await action({ action: "leaderboard", enabled });
  }

  async function buyFrame(frame: string, cost: number) {
    if (demo) {
      if (activeState.profile.trailTokens < cost) { setMessage("Keep learning to earn enough Trail Tokens."); return; }
      const next: LearnerState = { ...activeState, profile: { ...activeState.profile, trailTokens: activeState.profile.trailTokens - cost, avatar: { ...activeState.profile.avatar, frame } } };
      saveDemoState(next); setState(next); setMessage("Frame equipped."); return;
    }
    await action({ action: "purchaseFrame", frame });
  }

  return (
    <main className="learner-shell profile-page">
      <LearnerHeader state={state} demo={demo} />
      <section className="profile-wrap">
        <div className="profile-hero">
          <div className="profile-identity"><Avatar avatar={state.profile.avatar} size="lg" label="Your abstract avatar" /><div><span className="section-kicker">YOUR ANONYMOUS IDENTITY</span><h1>{state.profile.nickname}</h1><p>No custom text. No real name. Nothing another learner can search.</p></div></div>
          <button className="secondary-button" type="button" disabled={state.profile.rerollUsed} onClick={reroll}>{state.profile.rerollUsed ? "Free reroll used" : "Reroll once"}</button>
        </div>
        <div className="profile-stats"><article><span>◆</span><strong>{state.totalXp}</strong><small>Total XP</small></article><article><span>▲</span><strong>{state.profile.longestStreak}</strong><small>Longest streak</small></article><article><span>✓</span><strong>{state.completedLessons.length}</strong><small>Lessons complete</small></article><article><span>★</span><strong>{state.clearedBosses.length}</strong><small>Bosses cleared</small></article></div>

        <div className="profile-grid">
          <section className="locker-card">
            <header><div><span className="section-kicker">AVATAR LOCKER</span><h2>Earned, never purchased.</h2></div><span className="token-balance">◆ {state.profile.trailTokens} tokens</span></header>
            <p>Trail Tokens come from showing up. They have no cash value and there are no random rewards.</p>
            <div className="frame-grid">{frames.map((frame) => <button className={state.profile.avatar.frame === frame.id ? "equipped" : ""} type="button" onClick={() => buyFrame(frame.id, frame.cost)} key={frame.id}><Avatar avatar={{ ...state.profile.avatar, frame: frame.id }} size="md" /><strong>{frame.label}</strong><span>{state.profile.avatar.frame === frame.id ? "Equipped" : `◆ ${frame.cost}`}</span></button>)}</div>
          </section>
          <aside className="privacy-settings-card">
            <span className="section-kicker">PRIVACY CONTROLS</span><h2>You decide what is public.</h2>
            <div className="setting-row"><div><strong>Anonymous weekly league</strong><p>Show only this random avatar, nickname, rank, and weekly XP.</p></div><button className={`toggle ${state.profile.leaderboardOptIn ? "on" : ""}`} type="button" aria-pressed={state.profile.leaderboardOptIn} onClick={toggleLeaderboard}><span /></button></div>
            <div className="setting-row static"><div><strong>Google profile data</strong><p>Name, email, and photo are never saved.</p></div><span className="safe-chip">Not stored</span></div>
            <div className="setting-row static"><div><strong>Public profile and search</strong><p>No profile page, searchable ID, or public history exists.</p></div><span className="safe-chip">Off</span></div>
            <a className="text-link" href="/privacy">Read the full privacy promise</a>
          </aside>
        </div>

        <section className="account-settings">
          <div><span className="section-kicker">ACCOUNT</span><h2>Keep control of your trail.</h2><p>Sign out on this device, or permanently remove lessons, attempts, rewards, league entries, and sessions.</p></div>
          <button className="danger-button" type="button" onClick={() => setDeleteOpen(true)}>Delete my account</button>
        </section>
        {message && <div className="toast-message" role="status">{message}</div>}
      </section>
      {deleteOpen && <DeleteAccount demo={demo} clientId={clientId} onClose={() => setDeleteOpen(false)} />}
    </main>
  );
}

function DeleteAccount({ demo, clientId, onClose }: { demo: boolean; clientId: string; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (!confirmed || demo || !clientId) return;
    const render = () => {
      const element = document.getElementById("delete-google-button");
      if (!element || !window.google) return;
      element.replaceChildren();
      window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => {
        setStatus("Deleting your trail…");
        const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "deleteAccount", credential }) });
        if (response.ok) window.location.assign("/"); else setStatus("Reauthentication did not match this account.");
      } });
      window.google.accounts.id.renderButton(element, { type: "standard", theme: "outline", size: "large", text: "continue_with", width: 300 });
    };
    if (window.google) render(); else {
      const script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.onload = render; document.head.appendChild(script);
    }
  }, [clientId, confirmed, demo]);

  function deleteDemo() { window.sessionStorage.removeItem("math-demo-state"); window.location.assign("/"); }
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Delete account"><div className="delete-modal"><button className="modal-close" onClick={onClose} type="button">×</button><span className="danger-icon">!</span><span className="section-kicker">PERMANENT ACTION</span><h2>Delete your complete Math trail?</h2><p>This removes progress, attempts, rewards, your anonymous identity, league entries, and every active session. It cannot be undone.</p><label className="age-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I understand that this permanently deletes my account.</span></label>{confirmed && (demo ? <button className="danger-button full-button" type="button" onClick={deleteDemo}>Delete demo data</button> : clientId ? <div id="delete-google-button" className="google-button-slot" /> : <p className="form-error">Google reauthentication will be available when the production Client ID is connected.</p>)}{status && <p className="signin-status">{status}</p>}</div></div>;
}
