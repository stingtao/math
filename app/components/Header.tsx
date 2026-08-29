"use client";

import { usePathname } from "next/navigation";
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
        <a href="/#story">About</a>
        <a href="/#curriculum">Grades 7–9</a>
        <a href="/labs/linear-graphs">Graph Lab</a>
        <a href="/leaderboard">Leaderboard</a>
        <a href="/feedback">Feedback</a>
      </nav>
      <div className="public-actions">
        <details className="mobile-public-menu">
          <summary aria-label="Open navigation"><span aria-hidden="true">☰</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="/#story">About</a>
            <a href="/#curriculum">Grades 7–9</a>
            <a href="/labs/linear-graphs">Graph Lab</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/feedback">Feedback</a>
          </nav>
        </details>
        <a className="sign-in-button" href="/#join">Sign in</a>
      </div>
    </header>
  );
}

export function LearnerHeader({ state, demo }: { state: LearnerState; demo: boolean }) {
  const pathname = usePathname();
  const trailUrl = demo ? "/learn?demo=1" : "/learn";
  const reviewUrl = demo ? "/review?demo=1" : "/review";
  const profileUrl = demo ? "/profile?demo=1" : "/profile";
  const leagueUrl = demo ? "/leaderboard?demo=1" : "/leaderboard";
  const badgesUrl = demo ? "/badges?demo=1" : "/badges";
  const badgeCount = state.badges.earnedIds.length;
  const badgeCountLabel = badgeCount > 99 ? "99+" : badgeCount;
  async function logout() {
    if (!demo) await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }
  return (
    <>
      <header className="learner-topbar">
        <Brand />
        <nav className="learner-nav" aria-label="Learning navigation">
          <a href={trailUrl}>Trail</a>
          <a href={reviewUrl}>Review <span className="nav-count">{state.dueReview}</span></a>
          <a href={badgesUrl}>Badges <span className="badge-nav-count">{badgeCountLabel}</span></a>
          <a href={leagueUrl}>League</a>
        </nav>
        <div className="learner-stats">
          <span className="stat-chip token-chip" title="Trail Tokens">◆ {state.profile.trailTokens}</span>
          <span className="stat-chip streak-chip" title="Current streak">▲ {state.profile.currentStreak}</span>
          <a className="profile-link" href={profileUrl}>
            <Avatar avatar={state.profile.avatar} size="sm" />
            <span>{state.profile.nickname}</span>
          </a>
          <button className="icon-button logout-button" onClick={logout} type="button" aria-label="Sign out">↗</button>
        </div>
      </header>
      <nav className="mobile-learner-nav" aria-label="Mobile learning navigation">
        <a className={pathname.startsWith("/learn") || pathname.startsWith("/boss") ? "active" : ""} href={trailUrl}><span aria-hidden="true">◎</span><strong>Trail</strong></a>
        <a className={pathname.startsWith("/review") ? "active" : ""} href={reviewUrl}><span aria-hidden="true">◇</span><strong>Review</strong>{state.dueReview > 0 && <i>{state.dueReview}</i>}</a>
        <a className={pathname.startsWith("/badges") ? "active" : ""} href={badgesUrl}><span aria-hidden="true">◆</span><strong>Vault</strong>{badgeCount > 0 && <i>{badgeCountLabel}</i>}</a>
        <a className={pathname.startsWith("/leaderboard") ? "active" : ""} href={leagueUrl}><span aria-hidden="true">★</span><strong>League</strong></a>
        <a className={pathname.startsWith("/profile") ? "active" : ""} href={profileUrl}><span aria-hidden="true">●</span><strong>Me</strong></a>
      </nav>
    </>
  );
}
