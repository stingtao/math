"use client";

import { useEffect, useRef, useState } from "react";
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
import { ProgressDetailModal, type ProgressDetail } from "./ProgressDetailModal";
import { historyReplayDestination, learningMapDestination } from "@/lib/progress-replay";
import { lessonById } from "@/lib/curriculum";
import type { XpProgress as XpProgressState } from "@/lib/xp-progression";
import type { DataDeletionCategory } from "@/lib/data-retention";

export function ProfileView({ demo, clientId }: { demo: boolean; clientId: string }) {
  const { state, setState, loading, error, isDemo } = useLearner(demo);
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyFrame, setBusyFrame] = useState("");
  const [frameCelebrationKey, setFrameCelebrationKey] = useState("");
  const [busyTheme, setBusyTheme] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [detail, setDetail] = useState<ProgressDetail | null>(null);
  if (loading) return <LearningLoading glyph="✦" tone="violet" kicker="OPENING YOUR FAMILY SPACE" title="Loading your shared progress…" detail="Your family path, world, and learning history are almost ready." />;
  if (!state || error) return <LearningSignInGate glyph="✦" kicker="FAMILY PROGRESS IS PRIVATE" title="A parent signs in to open this space." detail="Only the adult account holder can see the family’s settings and saved learning history." />;
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

  async function deleteDataCategory(category: DataDeletionCategory, label: string) {
    if (isDemo || busyAction) return;
    const confirmed = window.confirm(`Delete ${label}? This saved data cannot be restored from your family space.`);
    if (!confirmed) return;
    setBusyAction(`delete:${category}`);
    try {
      const ok = await action({ action: "deleteDataCategory", category });
      if (ok) setMessage(`${label} deleted.`);
    } finally {
      setBusyAction("");
    }
  }

  function showHistoryDetail(entry: LearnerState["learningHistory"][number]) {
    const destination = historyReplayDestination(entry, isDemo);
    const result = entry.kind === "boss"
      ? `${entry.hearts ?? 0}/3 hearts`
      : `${entry.stars ?? 0}/3 stars`;
    const facts = [
      { label: "Grade", value: `Grade ${entry.grade}` },
      { label: "Region", value: entry.regionTitle },
      { label: "Completed", value: formatHistoryDate(entry.completedAt) },
      { label: "Best result", value: result },
    ];
    if (entry.kind === "lesson") facts.push({ label: "First try", value: `${entry.firstCorrectCount ?? 0}/${entry.questionCount ?? 0} questions` });
    setDetail({
      eyebrow: entry.kind === "boss" ? "BOSS HISTORY" : "LESSON HISTORY",
      title: entry.title,
      status: entry.kind === "boss" ? "Boss cleared" : "Lesson complete",
      description: entry.kind === "boss" ? "This challenge is cleared. Replay it to practice the region as one connected set." : "This lesson is saved in your private history. Replaying can improve your best stars without removing the clear.",
      glyph: entry.kind === "boss" ? "★" : "✓",
      tone: entry.kind === "boss" ? "gold" : "teal",
      facts,
      actionHref: destination.href,
      actionLabel: destination.label,
    });
  }

  function showAchievementDetail(item: ReturnType<typeof evaluateAchievements>[number]) {
    const latestLesson = activeState.learningHistory.find((entry) => entry.kind === "lesson");
    const latestBoss = activeState.learningHistory.find((entry) => entry.kind === "boss");
    const currentGrade = lessonById.get(activeState.nextLessonId)?.grade ?? latestLesson?.grade ?? 8;
    const destination = item.source === "bosses" && latestBoss
      ? historyReplayDestination(latestBoss, isDemo)
      : (item.source === "lessons" || item.source === "stars") && latestLesson
        ? historyReplayDestination(latestLesson, isDemo)
        : item.source === "streak"
          ? { href: isDemo ? "/review?demo=1" : "/review", label: item.unlocked ? "Practice again" : "Continue the streak" }
          : { href: learningMapDestination(currentGrade, isDemo), label: item.unlocked ? "Open completed map" : "Build progress" };
    setDetail({
      eyebrow: "ACHIEVEMENT DETAILS",
      title: item.title,
      status: item.unlocked ? "Achievement earned" : "In progress",
      description: item.copy,
      glyph: item.glyph,
      tone: item.tone,
      facts: [
        { label: "Progress", value: `${Math.min(item.value, item.target)}/${item.target} ${item.unit}${item.target === 1 ? "" : "s"}` },
        { label: "Goal", value: item.copy },
      ],
      actionHref: destination.href,
      actionLabel: destination.label,
    });
  }

  function showXpDetail(progress: XpProgressState) {
    const currentGrade = lessonById.get(activeState.nextLessonId)?.grade ?? 8;
    setDetail({
      eyebrow: "XP DETAILS",
      title: `Level ${progress.level} · ${progress.rankTitle}`,
      status: `${progress.totalXp} lifetime XP`,
      description: "Lessons, recall, and boss challenges add XP. Replay any cleared activity when you want another practice run.",
      glyph: String(progress.level),
      tone: "blue",
      facts: [
        { label: "This level", value: `${progress.earnedInLevel}/${progress.nextLevelXp - progress.levelStartXp} XP` },
        { label: "Next level", value: `${progress.xpToNextLevel} XP away` },
        { label: "Next rank", value: progress.nextRank ? `${progress.nextRank.title} at Level ${progress.nextRank.level}` : "Top current rank" },
      ],
      actionHref: learningMapDestination(currentGrade, isDemo),
      actionLabel: "Choose a mission",
    });
  }

  return (
    <main className="learner-shell profile-page">
      <LearnerHeader state={state} demo={isDemo} />
      {frameCelebrationKey && <SuccessBurst eventKey={`frame-${frameCelebrationKey}`} experienceLevel={state.completedLessons.length} />}
      <section className="profile-wrap">
        <div className={`profile-hero profile-command-deck theme-${world.id}`}>
          <div className="profile-world-art" style={{ backgroundPosition: world.atlasPosition }} aria-hidden="true"><span>{world.motif}</span><i /><i /><i /></div>
          <div className="profile-identity"><Avatar avatar={state.profile.avatar} size="lg" label="Your private family learning symbol" /><div><span className="section-kicker">FAMILY LEARNING SPACE</span><h1>{state.profile.nickname}</h1><p>One private record for the math you explore together. {journey.story}</p></div></div>
          <div className="profile-current-mission"><small>YOUR NEXT MOVE</small><strong>{journey.headline}</strong><p>{world.missionFocus.charAt(0).toUpperCase() + world.missionFocus.slice(1)}.</p><div><a className="primary-button" href={`/learn${isDemo ? "?demo=1" : ""}`}>Resume mission <span aria-hidden="true">→</span></a><button className="profile-reroll-button" type="button" disabled={state.profile.rerollUsed || Boolean(busyAction)} aria-busy={busyAction === "reroll"} onClick={reroll}>{busyAction === "reroll" ? "Rerolling…" : state.profile.rerollUsed ? "Codename reroll used" : "Reroll codename"}</button></div></div>
        </div>
        <XpProgress totalXp={state.totalXp} theme={state.profile.theme} completedLessons={state.completedLessons.length} onOpen={showXpDetail} />
        <div className="profile-stats profile-game-stats"><article><span>{world.motif}</span><strong>Mission {journey.stage}</strong><small>{journey.location}</small></article><article><span>✓</span><strong>{state.completedLessons.length}</strong><small>Routes cleared</small></article><article><span>★</span><strong>{state.clearedBosses.length}</strong><small>Boss gates</small></article><article><span>◆</span><strong>{state.weeklyXp}</strong><small>This week together</small></article></div>

        <section className="profile-learning-history" aria-labelledby="learning-history-heading">
          <header><div><span className="section-kicker">PRIVATE FAMILY RECORD</span><h2 id="learning-history-heading">Learning history</h2></div><strong>{state.learningHistory.length} cleared</strong></header>
          {historyByGrade.length === 0 ? <div className="history-empty"><span aria-hidden="true">◇</span><div><strong>Your first completed lesson will appear here.</strong><p>Only you can open this record.</p></div></div> : <div className="history-grade-list">
            {historyByGrade.map(([historyGrade, entries], gradeIndex) => <details open={gradeIndex === 0} key={historyGrade}>
              <summary><span>Grade {historyGrade}</span><small>{entries.length} {entries.length === 1 ? "clear" : "clears"}</small></summary>
              <div className="history-entry-list">{entries.map((entry) => <article className={`history-entry ${entry.kind}`} key={entry.key}>
                <button className="progress-detail-hitarea" type="button" onClick={() => showHistoryDetail(entry)} aria-label={`Open ${entry.title} completion details`} />
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
          {nextAchievement ? <div className={`next-achievement accent-${nextAchievement.tone}`}><button className="progress-detail-hitarea" type="button" onClick={() => showAchievementDetail(nextAchievement)} aria-label={`Open ${nextAchievement.title} progress details`} /><span className="achievement-badge" aria-hidden="true"><b>{nextAchievement.glyph}</b><i /></span><div><small>NEXT</small><strong>{nextAchievement.title}</strong><p>{nextAchievement.copy}</p></div><div className="next-achievement-progress"><span><b>{nextAchievement.value}</b> / {nextAchievement.target} {nextAchievement.unit}{nextAchievement.target === 1 ? "" : "s"}</span><i><b style={{ width: `${nextAchievement.progress}%` }} /></i></div></div> : <div className="next-achievement shelf-complete"><span className="achievement-badge" aria-hidden="true"><b>✓</b><i /></span><div><strong>All current achievements earned.</strong></div></div>}
          <div className="achievement-grid" role="list">{achievements.map((item) => <article className={`achievement-card accent-${item.tone} ${item.unlocked ? "unlocked" : "locked"}`} role="listitem" aria-label={`${item.title}: ${item.unlocked ? "unlocked" : `${item.value} of ${item.target}`}`} key={item.id}><button className="progress-detail-hitarea" type="button" onClick={() => showAchievementDetail(item)} aria-label={`Open ${item.title} achievement details`} /><span className="achievement-badge" aria-hidden="true"><b>{item.glyph}</b><i /></span><div><h3>{item.title}</h3><p>{item.copy}</p></div>{!item.unlocked && <div className="achievement-card-status"><span>{item.value}/{item.target}</span><i><b style={{ width: `${item.progress}%` }} /></i></div>}</article>)}</div>
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
            <span className="section-kicker">FAMILY PRIVACY</span><h2>Nothing here is public.</h2>
            <div className="setting-row static"><div><strong>Child account and identity</strong><p>No child login, name, email, birth date, school, photo, or voice is requested.</p></div><span className="safe-chip">Not collected</span></div>
            <div className="setting-row static"><div><strong>Advertising and public rankings</strong><p>No advertising code, public league, searchable profile, or public learning history is active.</p></div><span className="safe-chip">Off</span></div>
            <div className="setting-row static"><div><strong>Parent visibility</strong><p>The adult account holder can see this shared family learning record.</p></div><span className="safe-chip">Visible</span></div>
            {!isDemo && <div className="retention-deadlines">
              <div><small>Saved family data</small><strong>Deletes after {formatRetentionDate(state.retention.learningDataExpiresAt)}</strong></div>
              <div><small>Parent account</small><strong>Deletes after {formatRetentionDate(state.retention.accountExpiresAt)}</strong></div>
              <p>Each successful parent sign-in restarts these periods from that sign-in date. The daily cleanup normally completes within 24 hours after a deadline.</p>
            </div>}
            <a className="text-link" href="/privacy">Read the family privacy notice</a>
          </aside>
        </div>

        {!isDemo && <section className="data-controls" aria-labelledby="data-controls-heading">
          <header><div><span className="section-kicker">DELETE BY CATEGORY</span><h2 id="data-controls-heading">Choose what to remove.</h2><p>Your parent login stays active unless you use complete account deletion below.</p></div></header>
          <div className="data-control-grid">
            <article><div><strong>Learning records and rewards</strong><p>Lessons, answers, hints, review timing, challenges, XP, badges, rewards, and streaks.</p></div><button type="button" disabled={Boolean(busyAction)} onClick={() => void deleteDataCategory("learning", "learning records and rewards")}>{busyAction === "delete:learning" ? "Deleting…" : "Delete learning data"}</button></article>
            <article><div><strong>Family appearance</strong><p>Random family codename, avatar, theme, unlocked frames, and appearance settings reset to new defaults.</p></div><button type="button" disabled={Boolean(busyAction)} onClick={() => void deleteDataCategory("appearance", "family appearance data")}>{busyAction === "delete:appearance" ? "Deleting…" : "Reset appearance"}</button></article>
            <article><div><strong>Feedback discussions</strong><p>Topics you created and site-owner replies attached to them. Owner replies authored from this account are also removed.</p></div><button type="button" disabled={Boolean(busyAction)} onClick={() => void deleteDataCategory("feedback", "feedback discussion data")}>{busyAction === "delete:feedback" ? "Deleting…" : "Delete feedback"}</button></article>
            <article className="all-data-control"><div><strong>All saved family data</strong><p>Deletes all three categories and starts the family space again with a fresh private symbol. The parent account remains.</p></div><button type="button" disabled={Boolean(busyAction)} onClick={() => void deleteDataCategory("all", "all saved family data")}>{busyAction === "delete:all" ? "Deleting…" : "Delete all saved data"}</button></article>
          </div>
        </section>}

        <section className="account-settings">
          <div><span className="section-kicker">PARENT ACCOUNT</span><h2>Your family data stays under your control.</h2><p>Complete deletion removes the account key, consent record, shared learning data, feedback, and every active session.</p></div>
          <button className="danger-button" type="button" onClick={() => setDeleteOpen(true)}>Delete family account</button>
        </section>
        {message && <div className="toast-message" role="status">{message}</div>}
      </section>
      {deleteOpen && <DeleteAccount demo={isDemo} clientId={clientId} onClose={() => setDeleteOpen(false)} />}
      {detail && <ProgressDetailModal detail={detail} onClose={() => setDetail(null)} />}
    </main>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function formatRetentionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "the next successful sign-in";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}

function DeleteAccount({ demo, clientId, onClose }: { demo: boolean; clientId: string; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);
  useEffect(() => {
    if (!confirmed || demo || !clientId) return;
    const render = () => {
      const element = document.getElementById("delete-google-button");
      if (!element || !window.google) return;
      element.replaceChildren();
      window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => {
        if (deletingRef.current) return;
        deletingRef.current = true;
        setDeleting(true);
        setStatus("Deleting your family learning record…");
        try {
          const response = await fetch("/api/state", { method: "POST", headers: mutationHeaders(), body: JSON.stringify({ action: "deleteAccount", credential }) });
          if (response.ok) window.location.assign("/"); else { deletingRef.current = false; setDeleting(false); setStatus("Reauthentication did not match this account."); }
        } catch {
          deletingRef.current = false;
          setDeleting(false);
          setStatus("Deletion could not finish. Check your connection and try again.");
        }
      } });
      window.google.accounts.id.renderButton(element, { type: "standard", theme: "outline", size: "large", text: "continue_with", width: 300 });
    };
    if (window.google) render(); else {
      const script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.onload = render; document.head.appendChild(script);
    }
  }, [clientId, confirmed, demo]);

  function deleteDemo() {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setStatus("Deleting demo data…");
    window.sessionStorage.removeItem("math-demo-state");
    window.location.assign("/");
  }
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Delete family account"><div className="delete-modal"><button className="modal-close" onClick={onClose} type="button" disabled={deleting} aria-label="Close delete account dialog">×</button><span className="danger-icon">!</span><span className="section-kicker">PERMANENT ACTION</span><h2>Delete the complete parent account?</h2><p>This removes the protected sign-in key, consent record, shared learning data, feedback, private family symbol, and every active session. It cannot be undone.</p><label className="age-check"><input type="checkbox" checked={confirmed} disabled={deleting} onChange={(event) => setConfirmed(event.target.checked)} /><span>I understand that this permanently deletes the parent account and all data linked to it.</span></label>{confirmed && (demo ? <button className="danger-button full-button" type="button" disabled={deleting} aria-busy={deleting} onClick={deleteDemo}>{deleting ? "Deleting…" : "Delete preview data"}</button> : clientId ? <div id="delete-google-button" className="google-button-slot" aria-busy={deleting} /> : <p className="form-error">Google reauthentication will be available when the production Client ID is connected.</p>)}{status && <p className="signin-status">{status}</p>}</div></div>;
}
