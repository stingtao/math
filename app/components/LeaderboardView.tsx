"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { PublicHeader } from "./Header";
import type { AvatarSpec } from "@/lib/learner-state";

type Entry = { rank: number; nickname: string; avatar: AvatarSpec; weeklyXp: number };

export function LeaderboardView() {
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

  return (
    <main className="site-shell leaderboard-page">
      <PublicHeader />
      <section className="leaderboard-hero">
        <div><span className="eyebrow">ANONYMOUS WEEKLY LEAGUE</span><h1>This week’s anonymous scores.</h1><p>Learning XP resets every Monday. Real names, grades, accuracy, profiles, and history never appear here.</p></div>
        <div className="league-clock"><span>THIS LEAGUE</span><strong>{week || "Current week"}</strong><small>Resets Monday · 00:00 UTC</small></div>
      </section>
      <section className="leaderboard-wrap">
        <div className="podium">
          {[entries[1], entries[0], entries[2]].filter(Boolean).map((entry, index) => <article className={`podium-place podium-${index === 1 ? 1 : index === 0 ? 2 : 3}`} key={entry.nickname}><span className="podium-rank">{entry.rank}</span><Avatar avatar={entry.avatar} size="lg" label={`${entry.nickname}'s abstract avatar`} /><strong>{entry.nickname}</strong><span>{entry.weeklyXp} XP</span></article>)}
        </div>
        <div className="leaderboard-card">
          <header><div><span className="section-kicker">WEEKLY RANKING</span><h2>{scope === "your-league" ? "Your 30-person league" : "Public top 30"}</h2></div><span className="privacy-pill">✦ Anonymous by design</span></header>
          <ol className="leaderboard-list">
            {entries.map((entry) => <li key={entry.nickname}><span className={`rank-number rank-${entry.rank}`}>{entry.rank}</span><Avatar avatar={entry.avatar} size="sm" /><strong>{entry.nickname}</strong><span className="xp-bar"><i style={{ width: `${Math.max(12, (entry.weeklyXp / entries[0].weeklyXp) * 100)}%` }} /></span><b>{entry.weeklyXp} XP</b></li>)}
          </ol>
          {!entries.length && <div className="leaderboard-empty"><strong>The first anonymous league is forming.</strong><span>Finish a lesson and opt in from your private profile to appear here.</span></div>}
          <footer><span>Only first lesson clears, daily review, and boss wins count.</span><a href="/#join">Join the next league →</a></footer>
        </div>
        <aside className="leaderboard-privacy"><span className="privacy-shield">◇</span><div><h3>What the league never shows</h3><p>No real identity · no grade · no accuracy · no completed lesson list · no profile link · no searchable ID · no public archive.</p></div></aside>
      </section>
    </main>
  );
}
