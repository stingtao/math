"use client";

import { useEffect, useState } from "react";
import { saveDemoState, type LearnerState } from "@/lib/learner-state";
import { Avatar } from "./Avatar";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { mutationHeaders } from "./mutation";
import { avatarFrameCatalog } from "@/lib/avatar-frames";
import { SuccessBurst } from "./SuccessBurst";
import { evaluateAchievements } from "@/lib/achievements";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { getThemeJourney, getThemeSpec, themeCatalog, type ThemeId } from "@/lib/themes";
import { XpProgress } from "./XpProgress";

export function ProfileView({ demo, clientId }: { demo: boolean; clientId: string }) {
  const { state, setState, loading, error, isDemo } = useLearner(demo);
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyFrame, setBusyFrame] = useState("");
  const [frameCelebrationKey, setFrameCelebrationKey] = useState("");
  const [busyTheme, setBusyTheme] = useState("");
  const [busyAction, setBusyAction] = useState("");
  if (loading) return <LearningLoading glyph="✦" tone="violet" kicker="OPENING YOUR PRIVATE BASE" title="Loading your base…" detail="Your codename, world, and milestones are almost ready." />;
  if (!state || error) return <LearningSignInGate glyph="✦" kicker="YOUR BASE IS PRIVATE" title="Sign in to open your base." detail="Only you can see your settings, rewards, and learning milestones." />;
  const activeState = state;
  const totalStars = state.completedLessons.reduce((sum, item) => sum + item.stars, 0);
  const achievementValues = { lessons: state.completedLessons.length, stars: totalStars, bosses: state.clearedBosses.length, streak: state.profile.longestStreak };
  const achievements = evaluateAchievements(achievementValues);
  const nextAchievement = achievements.find((item) => !item.unlocked);
  const ownedFrames = new Set(["plain", ...state.profile.ownedFrames, state.profile.avatar.frame]);
  const nextFrame = avatarFrameCatalog.find((item) => item.cost > 0 && !ownedFrames.has(item.id));
  const nextFrameProgress = nextFrame ? Math.min(100, Math.round(state.profile.trailTokens / nextFrame.cost * 100)) : 100;
  const nextFrameNeeded = nextFrame ? Math.max(0, nextFrame.cost - state.profile.trailTokens) : 0;
  const world = getThemeSpec(state.profile.theme);
  const journey = getThemeJourney(state.profile.theme, { lessons: state.completedLessons.length, bosses: state.clearedBosses.length, dueReview: state.dueReview });
  const historyByGrade = [...state.learningHistory.reduce((groups, entry) => {
    const current = groups.get(entry.grade) ?? [];
    current.push(entry);
    groups.set(entry.grade, current);
    return groups;
  }, new Map<number, typeof state.learningHistory>())];

  async function action(payload: Record<string, unknown>) {
    if (isDemo) return null;
    try {
      const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify(payload) });
      const body = await response.json() as { state?: LearnerState; error?: string };
      if (body.state) setState(body.state);
      setMessage(response.ok ? "Saved." : body.error ?? "That change could not be saved.");
      return response.ok;
    } catch {
      setMessage("That change could not be saved. Check your connection and try again.");
      return false;
    }
  }

  async function reroll() {
    if (busyAction) return;
    setBusyAction("reroll");
    try {
      if (isDemo) {
        if (activeState.profile.rerollUsed) { setMessage("Your free identity reroll has already been used."); return; }
        const next: LearnerState = { ...activeState, profile: { ...activeState.profile, nickname: "NimbleOrbit731", avatar: { ...activeState.profile.avatar, glyph: "orbit", tone: "violet" }, rerollUsed: true } };
        saveDemoState(next); setState(next); setMessage("Your new anonymous identity is ready."); return;
      }
      await action({ action: "reroll" });
    } finally {
      setBusyAction("");
    }
  }

  async function toggleLeaderboard() {
    if (busyAction) return;
    setBusyAction("leaderboard");
    const enabled = !activeState.profile.leaderboardOptIn;
    try {
      if (isDemo) {
        const next: LearnerState = { ...activeState, profile: { ...activeState.profile, leaderboardOptIn: enabled } };
        saveDemoState(next); setState(next); setMessage(enabled ? "You joined the anonymous weekly league." : "You left the public league."); return;
      }
      await action({ action: "leaderboard", enabled });
    } finally {
      setBusyAction("");
    }
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
      if (isDemo) {
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
      setMessage(`${frameSpec.label} equipped.`);
      if (!wasOwned) setFrameCelebrationKey(`${frameSpec.id}-${Date.now()}`);
    } finally {
      setBusyFrame("");
    }
  }

  async function chooseTheme(theme: ThemeId) {
    if (busyTheme || activeState.profile.theme === theme) return;
    setBusyTheme(theme);
    try {
      if (isDemo) {
        const next: LearnerState = { ...activeState, profile: { ...activeState.profile, theme } };
        saveDemoState(next);
        setState(next);
      } else {
        const ok = await action({ action: "theme", theme });
        if (!ok) return;
      }
      setMessage(`${themeCatalog.find((item) => item.id === theme)?.name ?? "Theme"} is now active.`);
    } finally {
      setBusyTheme("");
    }
  }

  return (
    <main className="learner-shell profile-page">
      <LearnerHeader state={state} demo={isDemo} />
      {frameCelebrationKey && <SuccessBurst eventKey={`frame-${frameCelebrationKey}`} />}
      <section className="profile-wrap">
        <div className={`profile-hero profile-command-deck theme-${world.id}`}>
          <div className="profile-world-art" style={{ backgroundPosition: world.atlasPosition }} aria-hidden="true"><span>{world.motif}</span><i /><i /><i /></div>
          <div className="profile-identity"><Avatar avatar={state.profile.avatar} size="lg" label="Your anonymous game avatar" /><div><span className="section-kicker">{world.role.toUpperCase()}</span><h1>{state.profile.nickname}</h1><p>{journey.story}</p></div></div>
          <div className="profile-current-mission"><small>YOUR NEXT MOVE</small><strong>{journey.headline}</strong><p>{world.missionFocus.charAt(0).toUpperCase() + world.missionFocus.slice(1)}.</p><div><a className="primary-button" href={`/learn${isDemo ? "?demo=1" : ""}`}>Resume mission <span aria-hidden="true">→</span></a><button className="profile-reroll-button" type="button" disabled={state.profile.rerollUsed || Boolean(busyAction)} aria-busy={busyAction === "reroll"} onClick={reroll}>{busyAction === "reroll" ? "Rerolling…" : state.profile.rerollUsed ? "Codename reroll used" : "Reroll codename"}</button></div></div>
        </div>
        <XpProgress totalXp={state.totalXp} theme={state.profile.theme} />
        <div className="profile-stats profile-game-stats"><article><span>{world.motif}</span><strong>Mission {journey.stage}</strong><small>{journey.location}</small></article><article><span>✓</span><strong>{state.completedLessons.length}</strong><small>Routes cleared</small></article><article><span>★</span><strong>{state.clearedBosses.length}</strong><small>Boss gates</small></article><article><span>◆</span><strong>{state.weeklyXp}</strong><small>Weekly XP</small></article></div>

        <section className="profile-learning-history" aria-labelledby="learning-history-heading">
          <header><div><span className="section-kicker">PRIVATE RECORD</span><h2 id="learning-history-heading">Learning history</h2></div><strong>{state.learningHistory.length} cleared</strong></header>
          {historyByGrade.length === 0 ? <div className="history-empty"><span aria-hidden="true">◇</span><div><strong>Your first completed lesson will appear here.</strong><p>Only you can open this record.</p></div></div> : <div className="history-grade-list">
            {historyByGrade.map(([historyGrade, entries], gradeIndex) => <details open={gradeIndex === 0} key={historyGrade}>
              <summary><span>Grade {historyGrade}</span><small>{entries.length} {entries.length === 1 ? "clear" : "clears"}</small></summary>
              <div className="history-entry-list">{entries.map((entry) => <article className={`history-entry ${entry.kind}`} key={entry.key}>
                <span className="history-entry-icon" aria-hidden="true">{entry.kind === "boss" ? "★" : "✓"}</span>
                <div><strong>{entry.title}</strong><p>{entry.regionTitle} · <time dateTime={entry.completedAt}>{formatHistoryDate(entry.completedAt)}</time></p></div>
                <span className="history-result">{entry.kind === "boss" ? `${entry.hearts ?? 0}/3 ♥` : <>{"★".repeat(entry.stars ?? 0)}{"☆".repeat(3 - (entry.stars ?? 0))}<small>{entry.firstCorrectCount ?? 0}/{entry.questionCount ?? 0} first try</small></>}</span>
              </article>)}</div>
            </details>)}
          </div>}
        </section>

        <a className="profile-badge-vault" href={`/badges${isDemo ? "?demo=1" : ""}`}><span className="profile-badge-emblem" aria-hidden="true">{world.motif}<i /></span><div><small>{world.badgeLabel.toUpperCase()}</small><strong>Badges</strong><p>Next badge · {state.badges.correctAnswers % 10}/10 correct answers</p></div><i aria-hidden="true">→</i></a>

        <section className="theme-studio" aria-labelledby="theme-studio-heading">
          <header><div><span className="section-kicker">WORLD</span><h2 id="theme-studio-heading">Choose a world.</h2></div></header>
          <div className="theme-grid" role="radiogroup" aria-label="Choose a visual theme">
            {themeCatalog.map((theme) => {
              const selected = state.profile.theme === theme.id;
              return <button className={`theme-option theme-${theme.id} ${selected ? "selected" : ""}`} type="button" role="radio" aria-checked={selected} disabled={Boolean(busyTheme)} onClick={() => chooseTheme(theme.id)} key={theme.id}>
                <span className="theme-option-art" style={{ backgroundPosition: theme.atlasPosition }}><i aria-hidden="true">{theme.motif}</i>{selected && <b>✓</b>}</span>
                <span className="theme-option-copy"><small>{theme.kicker}</small><strong>{theme.name}</strong><span>{theme.copy}</span></span>
                <em>{busyTheme === theme.id ? "Saving…" : selected ? "Active" : "Use theme"}</em>
              </button>;
            })}
          </div>
        </section>

        <section className="achievement-section" aria-labelledby="achievement-heading">
          <header><h2 id="achievement-heading">Achievements</h2></header>
          {nextAchievement ? <div className={`next-achievement accent-${nextAchievement.tone}`}><span className="achievement-badge" aria-hidden="true"><b>{nextAchievement.glyph}</b><i /></span><div><small>NEXT</small><strong>{nextAchievement.title}</strong><p>{nextAchievement.copy}</p></div><div className="next-achievement-progress"><span><b>{nextAchievement.value}</b> / {nextAchievement.target} {nextAchievement.unit}{nextAchievement.target === 1 ? "" : "s"}</span><i><b style={{ width: `${nextAchievement.progress}%` }} /></i></div></div> : <div className="next-achievement shelf-complete"><span className="achievement-badge" aria-hidden="true"><b>✓</b><i /></span><div><strong>All current achievements earned.</strong></div></div>}
          <div className="achievement-grid" role="list">{achievements.map((item) => <article className={`achievement-card accent-${item.tone} ${item.unlocked ? "unlocked" : "locked"}`} role="listitem" aria-label={`${item.title}: ${item.unlocked ? "unlocked" : `${item.value} of ${item.target}`}`} key={item.id}><span className="achievement-badge" aria-hidden="true"><b>{item.glyph}</b><i /></span><div><h3>{item.title}</h3><p>{item.copy}</p></div>{!item.unlocked && <div className="achievement-card-status"><span>{item.value}/{item.target}</span><i><b style={{ width: `${item.progress}%` }} /></i></div>}</article>)}</div>
        </section>

        <div className="profile-grid">
          <section className="locker-card">
            <header><div><h2>Avatar frames</h2></div><span className="token-balance">◆ {state.profile.trailTokens} tokens</span></header>
            {nextFrame ? <div className={`locker-goal ${nextFrameNeeded === 0 ? "ready" : ""}`}>
              <Avatar avatar={{ ...state.profile.avatar, frame: nextFrame.id }} size="md" label={`${nextFrame.label} preview`} />
              <div><small>NEXT FRAME</small><strong>{nextFrame.label}</strong><p>{nextFrameNeeded === 0 ? "Ready to unlock." : `${nextFrameNeeded} more ${nextFrameNeeded === 1 ? "token" : "tokens"}.`}</p><span className="locker-goal-meter" role="progressbar" aria-label={`${nextFrame.label} token progress`} aria-valuemin={0} aria-valuemax={nextFrame.cost} aria-valuenow={Math.min(state.profile.trailTokens, nextFrame.cost)}><i style={{ width: `${nextFrameProgress}%` }} /></span></div>
              <b>{Math.min(state.profile.trailTokens, nextFrame.cost)}<small> / {nextFrame.cost}</small></b>
            </div> : <div className="locker-goal collection-complete"><span className="locker-complete-mark" aria-hidden="true">✓</span><div><strong>All current frames earned.</strong></div></div>}
            <div className="frame-grid">{avatarFrameCatalog.map((frame) => {
              const isEquipped = state.profile.avatar.frame === frame.id;
              const isOwned = ownedFrames.has(frame.id);
              const canUnlock = state.profile.trailTokens >= frame.cost;
              const status = isEquipped ? "Equipped" : isOwned ? "Equip" : canUnlock ? `Unlock · ◆ ${frame.cost}` : `${frame.cost - state.profile.trailTokens} tokens to go`;
              return <button className={`${isEquipped ? "equipped" : ""} ${isOwned ? "owned" : "locked"}`} type="button" disabled={isEquipped || Boolean(busyFrame) || (!isOwned && !canUnlock)} onClick={() => buyFrame(frame)} aria-label={`${frame.label}: ${status}`} key={frame.id}><Avatar avatar={{ ...state.profile.avatar, frame: frame.id }} size="md" /><strong>{frame.label}</strong><small>{frame.copy}</small><span>{busyFrame === frame.id ? "Saving…" : status}</span></button>;
            })}</div>
          </section>
          <aside className="privacy-settings-card">
            <span className="section-kicker">PRIVACY CONTROLS</span><h2>Choose what leaves your base.</h2>
            <div className="setting-row"><div><strong>Anonymous weekly league</strong><p>Joining creates a separate weekly alias. Your private profile codename never appears.</p></div><button className={`toggle ${state.profile.leaderboardOptIn ? "on" : ""}`} type="button" aria-pressed={state.profile.leaderboardOptIn} aria-busy={busyAction === "leaderboard"} disabled={Boolean(busyAction)} onClick={toggleLeaderboard}><span /></button></div>
            <div className="setting-row static"><div><strong>Google profile data</strong><p>Name, email, and photo are never saved.</p></div><span className="safe-chip">Not stored</span></div>
            <div className="setting-row static"><div><strong>Public profile and search</strong><p>No profile page, searchable ID, or public history exists.</p></div><span className="safe-chip">Off</span></div>
            <a className="text-link" href="/privacy">Read the full privacy promise</a>
          </aside>
        </div>

        <section className="account-settings">
          <div><span className="section-kicker">ACCOUNT</span><h2>Your data stays under your control.</h2><p>You can permanently remove progress, rewards, league entries, and active sessions.</p></div>
          <button className="danger-button" type="button" onClick={() => setDeleteOpen(true)}>Delete my account</button>
        </section>
        {message && <div className="toast-message" role="status">{message}</div>}
      </section>
      {deleteOpen && <DeleteAccount demo={isDemo} clientId={clientId} onClose={() => setDeleteOpen(false)} />}
    </main>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
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
