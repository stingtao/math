"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import type { LearnerState } from "@/lib/learner-state";
import { getThemeJourney, getThemeSpec } from "@/lib/themes";

export function Brand() {
  return <a className="brand" href="/" aria-label="Math home"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></a>;
}

export function PublicHeader() {
  return (
    <header className="topbar">
      <Brand />
      <nav className="topnav" aria-label="Main navigation">
        <a href="/#story">Mission loop</a>
        <a href="/#curriculum">Grades 7–12</a>
        <a href="/labs/linear-graphs">Graph Lab</a>
        <a href="/leaderboard">Weekly league</a>
        <a href="/feedback">Suggest a fix</a>
      </nav>
      <div className="public-actions">
        <details className="mobile-public-menu">
          <summary aria-label="Open navigation"><span aria-hidden="true">☰</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="/#story">Mission loop</a>
            <a href="/#curriculum">Grades 7–12</a>
            <a href="/labs/linear-graphs">Graph Lab</a>
            <a href="/leaderboard">Weekly league</a>
            <a href="/feedback">Suggest a fix</a>
          </nav>
        </details>
        <a className="sign-in-button" href="/#join">Save progress</a>
      </div>
    </header>
  );
}

export function LearnerHeader({ state, demo }: { state: LearnerState; demo: boolean }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = state.profile.theme;
    return () => { delete root.dataset.theme; };
  }, [state.profile.theme]);
  const trailUrl = demo ? "/learn?demo=1" : "/learn";
  const reviewUrl = demo ? "/review?demo=1" : "/review";
  const profileUrl = demo ? "/profile?demo=1" : "/profile";
  const leagueUrl = demo ? "/leaderboard?demo=1" : "/leaderboard";
  const badgesUrl = demo ? "/badges?demo=1" : "/badges";
  const world = getThemeSpec(state.profile.theme);
  const journey = getThemeJourney(state.profile.theme, { lessons: state.completedLessons.length, bosses: state.clearedBosses.length, dueReview: state.dueReview });
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      if (!demo) await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/");
    } catch {
      setLoggingOut(false);
    }
  }
  return (
    <>
      <header className="learner-topbar">
        <Brand />
        <nav className="learner-nav" aria-label="Learning navigation">
          <a href={trailUrl}>{world.mapLabel}</a>
          <a href={reviewUrl}>{world.reviewLabel} <span className="nav-count">{state.dueReview}</span></a>
          <a href={badgesUrl}>{world.badgeLabel}</a>
          <a href={leagueUrl}>{world.leagueLabel}</a>
        </nav>
        <div className="learner-stats">
          <span className="stat-chip token-chip" title="Trail Tokens">◆ {state.profile.trailTokens}</span>
          <span className="stat-chip streak-chip" title="Current streak">▲ {state.profile.currentStreak}</span>
          <a className="profile-link" href={profileUrl}>
            <Avatar avatar={state.profile.avatar} size="sm" />
            <span>{state.profile.nickname}</span>
          </a>
          <button className="icon-button logout-button" onClick={logout} type="button" disabled={loggingOut} aria-busy={loggingOut} aria-label={loggingOut ? "Signing out" : "Sign out"}>{loggingOut ? "…" : "↗"}</button>
        </div>
      </header>
      <aside className={`theme-world-hud theme-${world.id}`} aria-label={`Current learning world: ${world.worldName}`}>
        <span className="theme-world-hud-motif" aria-hidden="true">{world.motif}</span>
        <div className="theme-world-hud-place"><small>{world.worldName}</small><strong>{journey.headline}</strong></div>
      </aside>
      <nav className="mobile-learner-nav" aria-label="Mobile learning navigation">
        <a className={pathname.startsWith("/learn") || pathname.startsWith("/boss") ? "active" : ""} href={trailUrl}><span aria-hidden="true">◎</span><strong>Map</strong></a>
        <a className={pathname.startsWith("/review") ? "active" : ""} href={reviewUrl}><span aria-hidden="true">◇</span><strong>Recall</strong>{state.dueReview > 0 && <i>{state.dueReview}</i>}</a>
        <a className={pathname.startsWith("/badges") ? "active" : ""} href={badgesUrl}><span aria-hidden="true">◆</span><strong>Badges</strong></a>
        <a className={pathname.startsWith("/leaderboard") ? "active" : ""} href={leagueUrl}><span aria-hidden="true">★</span><strong>League</strong></a>
        <a className={pathname.startsWith("/profile") ? "active" : ""} href={profileUrl}><span aria-hidden="true">●</span><strong>Base</strong></a>
      </nav>
    </>
  );
}
