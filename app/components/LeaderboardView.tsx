"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { Brand, LearnerHeader, PublicHeader } from "./Header";
import type { AvatarSpec } from "@/lib/learner-state";
import { useLearner } from "./useLearner";

type Entry = { rank: number; nickname: string; avatar: AvatarSpec; weeklyXp: number; isViewer?: boolean };

export function LeaderboardView({ demo }: { demo: boolean }) {
  const { state, loading } = useLearner(demo);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [week, setWeek] = useState("");
  const [scope, setScope] = useState<"public" | "your-league">("public");
  useEffect(() => {
    fetch("/api/leaderboard").then(async (response) => {
      if (!response.ok) return;
      const data = await response.json() as { week: string; scope?: "public" | "your-league"; entries: Entry[] };
      setWeek(data.week);
      setScope(data.scope === "your-league" ? "your-league" : "public");
      setEntries(data.entries);
    }).catch(() => undefined);
  }, []);
  const viewerEntry = entries.find((entry) => entry.isViewer);
  const maxXp = Math.max(1, entries[0]?.weeklyXp ?? 0);
  const profileHref = demo ? "/profile?demo=1" : "/profile";

  return (
    <main className="site-shell leaderboard-page">
      {loading ? <header className="leaderboard-header-placeholder"><Brand /><span>Loading this week’s board…</span></header> : state ? <LearnerHeader state={state} demo={demo} /> : <PublicHeader />}
      <section className="leaderboard-hero">
        <div><span className="eyebrow">WEEKLY LEAGUE</span><h1>Race your week—not your identity.</h1><p>Random codenames only. XP resets Monday.</p></div>
        <div className="league-clock"><span>{scope === "your-league" ? "YOUR LEAGUE" : "PUBLIC BOARD"}</span><strong>{week || "Current week"}</strong><small>Resets Monday · 00:00 UTC</small></div>
      </section>
      <section className="leaderboard-wrap">
        {viewerEntry && <div className="current-rank-card"><Avatar avatar={viewerEntry.avatar} size="md" label="Your league avatar" /><div><strong>Rank {viewerEntry.rank}</strong></div><span><b>{viewerEntry.weeklyXp}</b> XP</span></div>}
        {state && !viewerEntry && <div className="league-view-note"><span aria-hidden="true">◇</span><div><strong>{demo ? "Previewing the public board" : "You are not shown on this board"}</strong><p>{demo ? "Demo progress stays on this device and is never posted." : "Your anonymous identity remains private until you opt in."}</p></div><a href={profileHref}>{demo ? "Open demo profile" : "League privacy settings"} →</a></div>}
        {entries.length > 0 && <div className="podium">
          {[entries[1], entries[0], entries[2]].filter(Boolean).map((entry, index) => <article className={`podium-place podium-${index === 1 ? 1 : index === 0 ? 2 : 3} ${entry.isViewer ? "current-learner" : ""}`} key={entry.nickname}><span className="podium-rank">{entry.rank}</span><Avatar avatar={entry.avatar} size="lg" label={`${entry.nickname}'s abstract avatar`} /><strong>{entry.nickname}{entry.isViewer && <small>YOU</small>}</strong><span>{entry.weeklyXp} XP</span></article>)}
        </div>}
        <div className="leaderboard-card">
          <header><div><span className="section-kicker">WEEKLY RANKING</span><h2>{scope === "your-league" ? "Your league" : "Current standings"}</h2></div></header>
          <ol className="leaderboard-list">
            {entries.map((entry) => <li className={entry.isViewer ? "current-learner" : ""} key={entry.nickname}><span className={`rank-number rank-${entry.rank}`}>{entry.rank}</span><Avatar avatar={entry.avatar} size="sm" /><strong>{entry.nickname}{entry.isViewer && <small>YOU</small>}</strong><span className="xp-bar"><i style={{ width: `${entry.weeklyXp > 0 ? Math.max(12, entry.weeklyXp / maxXp * 100) : 0}%` }} /></span><b>{entry.weeklyXp} XP</b></li>)}
          </ol>
          {!entries.length && <div className="leaderboard-empty"><strong>No rankings yet.</strong><span>Finish a lesson to start this week’s board.</span></div>}
          <footer><span>Lesson clears, daily review, and boss wins add XP.</span><a href={state ? profileHref : "/#join"}>{state ? "League settings" : "Join the league"} →</a></footer>
        </div>
      </section>
    </main>
  );
}
