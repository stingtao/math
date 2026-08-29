"use client";

import { useMemo, useState } from "react";
import { BADGE_CATALOG_SIZE, badgeCatalog, badgeById, badgeProgress, nextAnswerBadge, type BadgeKind } from "@/lib/badges";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeMedallion } from "./BadgeMedallion";

type BadgeFilter = "all" | "earned" | BadgeKind;

export function BadgeGallery({ demo }: { demo: boolean }) {
  const { state, loading, error } = useLearner(demo);
  const [filter, setFilter] = useState<BadgeFilter>("all");
  const [visibleCount, setVisibleCount] = useState(48);
  const earned = useMemo(() => new Set(state?.badges.earnedIds ?? []), [state]);
  const filtered = useMemo(() => badgeCatalog.filter((badge) => filter === "all" ? true : filter === "earned" ? earned.has(badge.id) : badge.kind === filter), [earned, filter]);

  if (loading) return <LearningLoading glyph="◆" tone="violet" kicker="OPENING THE BADGE VAULT" title="Loading your trophies…" detail="Your earned badges and next target are almost ready." />;
  if (!state || error) return <LearningSignInGate glyph="◆" kicker="YOUR COLLECTION IS PRIVATE" title="Sign in to open your vault." detail="Only you can see which badges you earned and what unlocks next." />;

  const earnedCount = earned.size;
  const vaultLevel = Math.min(50, Math.floor(earnedCount / 10) + 1);
  const levelStart = Math.floor(earnedCount / 10) * 10;
  const levelTarget = Math.min(BADGE_CATALOG_SIZE, levelStart + 10);
  const levelProgress = earnedCount === BADGE_CATALOG_SIZE ? 100 : (earnedCount - levelStart) * 10;
  const nextAnswer = nextAnswerBadge(state.badges.correctAnswers);
  const answerRemainder = state.badges.correctAnswers % 10;
  const recent = state.badges.recent.map((item) => ({ ...item, badge: badgeById.get(item.id) })).filter((item) => item.badge).slice(0, 3);
  const shown = filtered.slice(0, visibleCount);

  function chooseFilter(next: BadgeFilter) { setFilter(next); setVisibleCount(48); }

  return (
    <main className="learner-shell badge-vault-page">
      <LearnerHeader state={state} demo={demo} />
      <section className="badge-vault-wrap">
        <header className="badge-vault-hero">
          <div className="badge-vault-heading"><span className="section-kicker">PRIVATE COLLECTION · 500 BADGES</span><h1>Badge Vault</h1><p>Clear a lesson for a crest. Every 10 answer credits unlocks another trophy.</p></div>
          <div className="vault-level-card" aria-label={`Badge Vault level ${vaultLevel} of 50`}>
            <div className="vault-level-emblem"><span>{String(vaultLevel).padStart(2, "0")}</span><i /></div>
            <div><small>VAULT LEVEL</small><strong>{earnedCount === BADGE_CATALOG_SIZE ? "Legend complete" : `${earnedCount - levelStart} of 10 trophies`}</strong><p>{earnedCount === BADGE_CATALOG_SIZE ? "All 500 designs are yours." : `${levelTarget - earnedCount} until Level ${Math.min(50, vaultLevel + 1)}.`}</p><i className="vault-level-meter"><b style={{ width: `${levelProgress}%` }} /></i></div>
          </div>
        </header>

        <div className="badge-vault-stats" aria-label="Badge collection summary">
          <span><b>{earnedCount}</b><strong>earned</strong><small>of 500 permanent</small></span>
          <span><b>{state.badges.correctAnswers}</b><strong>answer credits</strong><small>server-verified</small></span>
          <span><b>{badgeCatalog.filter((item) => item.kind === "lesson" && earned.has(item.id)).length}</b><strong>lesson crests</strong><small>of 124 lessons</small></span>
        </div>

        <section className="badge-next-quest accent-violet" aria-labelledby="answer-quest-heading">
          {nextAnswer ? <><BadgeMedallion badge={nextAnswer} earned={false} size="lg" /><div><span>ANSWER QUEST · NEXT SIGNAL</span><h2 id="answer-quest-heading">{nextAnswer.title}</h2><p>{answerRemainder === 0 ? "The next ten-question signal is ready to begin." : `${10 - answerRemainder} more qualified correct ${10 - answerRemainder === 1 ? "answer" : "answers"} will unlock it.`}</p><div className="badge-next-meter"><i><b style={{ width: `${answerRemainder * 10}%` }} /></i><strong>{answerRemainder}/10</strong></div></div><b className="badge-next-target">{nextAnswer.target.toLocaleString("en-US")}<small>correct</small></b></> : <><div className="vault-complete-glyph">✓</div><div><span>ANSWER QUEST COMPLETE</span><h2 id="answer-quest-heading">All signals collected.</h2><p>You own every Answer Quest badge in the 500-piece vault.</p></div></>}
        </section>

        {recent.length > 0 && <section className="badge-recent-section"><header><div><span className="section-kicker">RECENT HONORS</span><h2>Newest in your vault</h2></div><p>Badge ownership and dates stay private.</p></header><div className="badge-recent-grid">{recent.map(({ badge, unlockedAt }) => <article className={`accent-${badge!.tone}`} key={badge!.id}><BadgeMedallion badge={badge!} earned size="lg" /><div><small>{badge!.rankLabel}</small><h3>{badge!.title}</h3><p>{badge!.series}</p><time dateTime={unlockedAt}>Earned {new Date(unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time></div></article>)}</div></section>}

        <section className="badge-catalog-section" aria-labelledby="badge-catalog-heading">
          <header><div><span className="section-kicker">CHOOSE A TARGET</span><h2 id="badge-catalog-heading">Every badge shows the next move.</h2><p>No loot boxes or purchases. Unlocks come from lessons and correct answers.</p></div><span className="badge-catalog-count"><b>{filtered.filter((item) => earned.has(item.id)).length}</b> / {filtered.length} in view</span></header>
          <div className="badge-filter-bar" role="group" aria-label="Filter badges">
            {([['all', 'All 500'], ['earned', 'Earned'], ['lesson', 'Lesson Crests'], ['answer', 'Answer Quest']] as Array<[BadgeFilter, string]>).map(([value, label]) => <button className={filter === value ? "active" : ""} type="button" aria-pressed={filter === value} onClick={() => chooseFilter(value)} key={value}>{label}</button>)}
          </div>
          <div className="badge-catalog-grid">{shown.map((badge) => {
            const owned = earned.has(badge.id);
            const progress = badgeProgress(badge, state.badges.correctAnswers, owned);
            return <article className={`badge-catalog-card accent-${badge.tone} ${owned ? "earned" : "locked"}`} key={badge.id}><BadgeMedallion badge={badge} earned={owned} size="md" /><div className="badge-card-copy"><small>{badge.rankLabel} · #{String(badge.catalogNumber).padStart(3, "0")}</small><h3>{badge.title}</h3><p>{owned ? badge.copy : badge.requirement}</p></div><div className="badge-card-status"><span>{owned ? "EARNED · PERMANENT" : `${progress}% TOWARD UNLOCK`}</span><i><b style={{ width: `${progress}%` }} /></i></div></article>;
          })}</div>
          {visibleCount < filtered.length && <button className="secondary-button badge-show-more" type="button" onClick={() => setVisibleCount((value) => value + 48)}>Show 48 more <span aria-hidden="true">↓</span></button>}
          {!shown.length && <div className="badge-empty-filter"><span aria-hidden="true">◇</span><strong>No badges in this filter yet.</strong><p>Your first completed lesson will place a permanent crest here.</p></div>}
        </section>
      </section>
    </main>
  );
}
