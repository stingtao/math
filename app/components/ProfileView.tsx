"use client";

import { useEffect, useState } from "react";
import { saveDemoState, type LearnerState } from "@/lib/learner-state";
import { Avatar } from "./Avatar";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { avatarFrameCatalog } from "@/lib/avatar-frames";
import { SuccessBurst } from "./SuccessBurst";

const achievementSpecs = [
  { id: "first-step", title: "First Step", copy: "Finish one lesson.", glyph: "→", tone: "blue", source: "lessons", target: 1, unit: "lesson" },
  { id: "star-spark", title: "Twelve Sparks", copy: "Collect twelve lesson stars.", glyph: "✦", tone: "gold", source: "stars", target: 12, unit: "star" },
  { id: "boss-link", title: "Boss Link", copy: "Clear your first mixed boss.", glyph: "★", tone: "coral", source: "bosses", target: 1, unit: "boss" },
  { id: "steady-week", title: "Steady Week", copy: "Reach a seven-day learning rhythm.", glyph: "▲", tone: "teal", source: "streak", target: 7, unit: "day" },
  { id: "trail-builder", title: "Trail Builder", copy: "Complete twenty lessons.", glyph: "◆", tone: "violet", source: "lessons", target: 20, unit: "lesson" },
  { id: "boss-pathfinder", title: "Boss Pathfinder", copy: "Clear eight region bosses.", glyph: "◎", tone: "blue", source: "bosses", target: 8, unit: "boss" },
] as const;

export function ProfileView({ demo, clientId }: { demo: boolean; clientId: string }) {
  const { state, setState, loading, error } = useLearner(demo);
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyFrame, setBusyFrame] = useState("");
  const [frameCelebrationKey, setFrameCelebrationKey] = useState("");
  if (loading) return <main className="loading-page" role="status"><div className="loading-mark">✦</div><p>Opening your anonymous profile…</p></main>;
  if (!state || error) return <main className="auth-gate"><div className="auth-card"><span className="auth-orbit">✦</span><h1>Sign in to view your profile.</h1><a className="primary-button" href="/#join">Continue with Google <span>→</span></a></div></main>;
  const activeState = state;
  const totalStars = state.completedLessons.reduce((sum, item) => sum + item.stars, 0);
  const achievementValues = { lessons: state.completedLessons.length, stars: totalStars, bosses: state.clearedBosses.length, streak: state.profile.longestStreak };
  const achievements = achievementSpecs.map((item) => {
    const value = achievementValues[item.source];
    return { ...item, value, unlocked: value >= item.target, progress: Math.min(100, Math.round(value / item.target * 100)) };
  });
  const unlockedAchievements = achievements.filter((item) => item.unlocked).length;
  const nextAchievement = achievements.find((item) => !item.unlocked);
  const ownedFrames = new Set(["plain", ...state.profile.ownedFrames, state.profile.avatar.frame]);
  const nextFrame = avatarFrameCatalog.find((item) => item.cost > 0 && !ownedFrames.has(item.id));
  const nextFrameProgress = nextFrame ? Math.min(100, Math.round(state.profile.trailTokens / nextFrame.cost * 100)) : 100;
  const nextFrameNeeded = nextFrame ? Math.max(0, nextFrame.cost - state.profile.trailTokens) : 0;

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

  async function buyFrame(frameSpec: (typeof avatarFrameCatalog)[number]) {
    if (busyFrame || activeState.profile.avatar.frame === frameSpec.id) return;
    const wasOwned = ownedFrames.has(frameSpec.id);
    if (!wasOwned && activeState.profile.trailTokens < frameSpec.cost) {
      setMessage(`${frameSpec.cost - activeState.profile.trailTokens} more Trail Tokens unlock ${frameSpec.label}.`);
      return;
    }
    setBusyFrame(frameSpec.id);
    try {
      if (demo) {
        const next: LearnerState = {
          ...activeState,
          profile: {
            ...activeState.profile,
            trailTokens: activeState.profile.trailTokens - (wasOwned ? 0 : frameSpec.cost),
            ownedFrames: wasOwned ? activeState.profile.ownedFrames : [...activeState.profile.ownedFrames, frameSpec.id],
            avatar: { ...activeState.profile.avatar, frame: frameSpec.id },
          },
        };
        saveDemoState(next);
        setState(next);
      } else {
        const ok = await action({ action: "purchaseFrame", frame: frameSpec.id });
        if (!ok) return;
      }
      setMessage(wasOwned ? `${frameSpec.label} equipped. No tokens spent.` : `${frameSpec.label} unlocked forever and equipped.`);
      if (!wasOwned) setFrameCelebrationKey(`${frameSpec.id}-${Date.now()}`);
    } finally {
      setBusyFrame("");
    }
  }

  return (
    <main className="learner-shell profile-page">
      <LearnerHeader state={state} demo={demo} />
      {frameCelebrationKey && <SuccessBurst eventKey={`frame-${frameCelebrationKey}`} />}
      <section className="profile-wrap">
        <div className="profile-hero">
          <div className="profile-identity"><Avatar avatar={state.profile.avatar} size="lg" label="Your abstract avatar" /><div><span className="section-kicker">YOUR ANONYMOUS IDENTITY</span><h1>{state.profile.nickname}</h1><p>No custom text. No real name. Nothing another learner can search.</p></div></div>
          <button className="secondary-button" type="button" disabled={state.profile.rerollUsed} onClick={reroll}>{state.profile.rerollUsed ? "Free reroll used" : "Reroll once"}</button>
        </div>
        <div className="profile-stats"><article><span>◆</span><strong>{state.totalXp}</strong><small>Total XP</small></article><article><span>▲</span><strong>{state.profile.longestStreak}</strong><small>Longest streak</small></article><article><span>✓</span><strong>{state.completedLessons.length}</strong><small>Lessons complete</small></article><article><span>★</span><strong>{state.clearedBosses.length}</strong><small>Bosses cleared</small></article></div>

        <section className="achievement-section" aria-labelledby="achievement-heading">
          <header><div><span className="section-kicker">PRIVATE ACHIEVEMENT SHELF</span><h2 id="achievement-heading">Your progress has landmarks.</h2><p>Badges appear automatically from lessons, stars, bosses, and your longest rhythm.</p></div><span className="achievement-count"><strong>{unlockedAchievements}</strong> / {achievements.length} unlocked</span></header>
          {nextAchievement ? <div className={`next-achievement accent-${nextAchievement.tone}`}><span className="achievement-badge" aria-hidden="true"><b>{nextAchievement.glyph}</b><i /></span><div><small>UP NEXT</small><strong>{nextAchievement.title}</strong><p>{nextAchievement.copy}</p></div><div className="next-achievement-progress"><span><b>{nextAchievement.value}</b> / {nextAchievement.target} {nextAchievement.unit}{nextAchievement.target === 1 ? "" : "s"}</span><i><b style={{ width: `${nextAchievement.progress}%` }} /></i></div></div> : <div className="next-achievement shelf-complete"><span className="achievement-badge" aria-hidden="true"><b>✓</b><i /></span><div><small>SHELF COMPLETE</small><strong>Every current badge is yours.</strong><p>Keep exploring—the next trail landmark can arrive in a future update.</p></div></div>}
          <div className="achievement-grid" role="list">{achievements.map((item) => <article className={`achievement-card accent-${item.tone} ${item.unlocked ? "unlocked" : "locked"}`} role="listitem" aria-label={`${item.title}: ${item.unlocked ? "unlocked" : `${item.value} of ${item.target}`}`} key={item.id}><span className="achievement-badge" aria-hidden="true"><b>{item.glyph}</b><i /></span><div><h3>{item.title}</h3><p>{item.copy}</p></div><div className="achievement-card-status"><span>{item.unlocked ? "UNLOCKED" : `${item.value}/${item.target}`}</span><i><b style={{ width: `${item.progress}%` }} /></i></div></article>)}</div>
          <footer><span aria-hidden="true">◇</span><p><strong>Only you see this shelf.</strong> Achievements are not added to the leaderboard or a public profile.</p></footer>
        </section>

        <div className="profile-grid">
          <section className="locker-card">
            <header><div><span className="section-kicker">AVATAR LOCKER</span><h2>Earned, never purchased.</h2></div><span className="token-balance">◆ {state.profile.trailTokens} tokens</span></header>
            <p>Trail Tokens come from showing up. Unlock a frame once, then switch your collection anytime without spending again.</p>
            {nextFrame ? <div className={`locker-goal ${nextFrameNeeded === 0 ? "ready" : ""}`}>
              <Avatar avatar={{ ...state.profile.avatar, frame: nextFrame.id }} size="md" label={`${nextFrame.label} preview`} />
              <div><small>{nextFrameNeeded === 0 ? "READY TO UNLOCK" : "NEXT COLLECTION GOAL"}</small><strong>{nextFrame.label}</strong><p>{nextFrameNeeded === 0 ? `You have enough tokens. Unlock it below.` : `${nextFrameNeeded} more ${nextFrameNeeded === 1 ? "token" : "tokens"} to make it yours forever.`}</p><span className="locker-goal-meter" role="progressbar" aria-label={`${nextFrame.label} token progress`} aria-valuemin={0} aria-valuemax={nextFrame.cost} aria-valuenow={Math.min(state.profile.trailTokens, nextFrame.cost)}><i style={{ width: `${nextFrameProgress}%` }} /></span></div>
              <b>{Math.min(state.profile.trailTokens, nextFrame.cost)}<small> / {nextFrame.cost}</small></b>
            </div> : <div className="locker-goal collection-complete"><span className="locker-complete-mark" aria-hidden="true">✓</span><div><small>COLLECTION COMPLETE</small><strong>Every current frame is yours.</strong><p>Keep your tokens—new trail rewards can arrive in a future update.</p></div></div>}
            <div className="frame-grid">{avatarFrameCatalog.map((frame) => {
              const isEquipped = state.profile.avatar.frame === frame.id;
              const isOwned = ownedFrames.has(frame.id);
              const canUnlock = state.profile.trailTokens >= frame.cost;
              const status = isEquipped ? "Equipped" : isOwned ? "Owned · Equip" : canUnlock ? `Unlock · ◆ ${frame.cost}` : `${frame.cost - state.profile.trailTokens} tokens to go`;
              return <button className={`${isEquipped ? "equipped" : ""} ${isOwned ? "owned" : "locked"}`} type="button" disabled={isEquipped || Boolean(busyFrame) || (!isOwned && !canUnlock)} onClick={() => buyFrame(frame)} aria-label={`${frame.label}: ${status}`} key={frame.id}><Avatar avatar={{ ...state.profile.avatar, frame: frame.id }} size="md" /><strong>{frame.label}</strong><small>{frame.copy}</small><span>{busyFrame === frame.id ? "Saving…" : status}</span></button>;
            })}</div>
            <footer className="locker-promise"><span aria-hidden="true">◇</span><p><strong>{ownedFrames.size} of {avatarFrameCatalog.length} collected.</strong> Frames are private cosmetics; they never affect XP, lessons, or leaderboard rank.</p></footer>
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
