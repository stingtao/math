"use client";

import { Avatar } from "./Avatar";
import type { LearnerState } from "@/lib/learner-state";

export function Brand() {
  return <a className="brand" href="/" aria-label="Math home"><span className="brand-mark" aria-hidden="true">M</span><span>Math</span></a>;
}

export function PublicHeader() {
  return (
    <header className="topbar">
      <Brand />
      <nav className="topnav" aria-label="Main navigation">
        <a href="/#how">How it works</a>
        <a href="/#curriculum">Curriculum</a>
        <a href="/leaderboard">Leaderboard</a>
      </nav>
      <a className="sign-in-button" href="/#join">Sign in</a>
    </header>
  );
}

export function LearnerHeader({ state, demo }: { state: LearnerState; demo: boolean }) {
  async function logout() {
    if (!demo) await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }
  return (
    <header className="learner-topbar">
      <Brand />
      <nav className="learner-nav" aria-label="Learning navigation">
        <a href={demo ? "/learn?demo=1" : "/learn"}>Trail</a>
        <a href={demo ? "/review?demo=1" : "/review"}>Review <span className="nav-count">{state.dueReview}</span></a>
        <a href="/leaderboard">League</a>
      </nav>
      <div className="learner-stats">
        <span className="stat-chip token-chip" title="Trail Tokens">◆ {state.profile.trailTokens}</span>
        <span className="stat-chip streak-chip" title="Current streak">▲ {state.profile.currentStreak}</span>
        <a className="profile-link" href={demo ? "/profile?demo=1" : "/profile"}>
          <Avatar avatar={state.profile.avatar} size="sm" />
          <span>{state.profile.nickname}</span>
        </a>
        <button className="icon-button logout-button" onClick={logout} type="button" aria-label="Sign out">↗</button>
      </div>
    </header>
  );
}
