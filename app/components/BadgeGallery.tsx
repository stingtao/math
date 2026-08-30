"use client";

import { useMemo, useState } from "react";
import { badgeCatalog, nextAnswerBadge, type BadgeKind } from "@/lib/badges";
import { LearnerHeader } from "./Header";
import { useLearner } from "./useLearner";
import { LearningLoading, LearningSignInGate } from "./LearningGate";
import { BadgeMedallion } from "./BadgeMedallion";
import { ProgressDetailModal, type ProgressDetail } from "./ProgressDetailModal";
import { useContentStart } from "./useContentStart";
import { badgeReplayDestination } from "@/lib/progress-replay";
import type { BadgeSpec } from "@/lib/badges";

type BadgeFilter = "all" | "earned" | BadgeKind;

export function BadgeGallery({ demo }: { demo: boolean }) {
  const { state, loading, error, isDemo } = useLearner(demo);
  const [filter, setFilter] = useState<BadgeFilter>("earned");
  const [visibleCount, setVisibleCount] = useState(48);
  const [revealedPage, setRevealedPage] = useState(0);
  const firstNewBadgeRef = useContentStart<HTMLElement>(`badge-page-${revealedPage}`);
  const [detail, setDetail] = useState<ProgressDetail | null>(null);
  const earned = useMemo(() => new Set(state?.badges.earnedIds ?? []), [state]);
  const filtered = useMemo(() => badgeCatalog.filter((badge) => filter === "all" ? true : filter === "earned" ? earned.has(badge.id) : badge.kind === filter), [earned, filter]);

  if (loading) return <LearningLoading glyph="◆" tone="violet" kicker="OPENING THE BADGE VAULT" title="Loading your trophies…" detail="Your earned badges and next target are almost ready." />;
  if (!state || error) return <LearningSignInGate glyph="◆" kicker="YOUR COLLECTION IS PRIVATE" title="Sign in to open your vault." detail="Only you can see which badges you earned and what unlocks next." />;
  const activeState = state;

  const nextAnswer = nextAnswerBadge(activeState.badges.correctAnswers);
  const answerRemainder = activeState.badges.correctAnswers % 10;
  const shown = filtered.slice(0, visibleCount);

  function chooseFilter(next: BadgeFilter) { setFilter(next); setVisibleCount(48); setRevealedPage(0); }

  function showMore() {
    setVisibleCount((value) => value + 48);
    setRevealedPage((value) => value + 1);
  }

  function showBadgeDetail(badge: BadgeSpec, owned: boolean) {
    const destination = badgeReplayDestination(badge, isDemo, owned, activeState.dueReview > 0);
    const lessonHistory = badge.lessonId ? activeState.learningHistory.find((entry) => entry.lessonId === badge.lessonId || entry.key === `lesson:${badge.lessonId}`) : undefined;
    const recentUnlock = activeState.badges.recent.find((item) => item.id === badge.id);
    const facts = badge.kind === "lesson"
      ? [
          { label: "Type", value: "Lesson badge" },
          { label: "Learning route", value: badge.series },
          ...(lessonHistory ? [
            { label: "Best result", value: `${lessonHistory.stars ?? 0}/3 stars` },
            { label: "Completed", value: formatBadgeDate(lessonHistory.completedAt) },
          ] : []),
        ]
      : [
          { label: "Type", value: "Answer badge" },
          { label: "Goal", value: `${badge.target.toLocaleString("en-US")} correct answers` },
          { label: "Current progress", value: `${Math.min(activeState.badges.correctAnswers, badge.target).toLocaleString("en-US")}/${badge.target.toLocaleString("en-US")}` },
          ...(recentUnlock ? [{ label: "Earned", value: formatBadgeDate(recentUnlock.unlockedAt) }] : []),
        ];
    setDetail({
      eyebrow: "BADGE DETAILS",
      title: badge.title,
      status: owned ? "Badge earned" : "Not earned yet",
      description: badge.kind === "lesson"
        ? owned ? `You earned this badge by completing ${badge.title.replace(/^Grade \d+ | Crest$/g, "")}.` : badge.requirement
        : owned ? `You reached ${badge.target.toLocaleString("en-US")} correct answers across lessons and recall.` : badge.requirement,
      glyph: badge.glyph,
      tone: badge.tone,
      facts,
      actionHref: destination.href,
      actionLabel: destination.label,
      visual: <BadgeMedallion badge={badge} earned={owned} size="md" />,
    });
  }

  return (
    <main className="learner-shell badge-vault-page">
      <LearnerHeader state={state} demo={isDemo} />
      <section className="badge-vault-wrap">
        <header className="badge-vault-hero">
          <div className="badge-vault-heading"><h1>Badges</h1></div>
        </header>

        <section className="badge-next-quest accent-violet" aria-labelledby="answer-quest-heading">
          {nextAnswer ? <><button className="progress-detail-hitarea" type="button" onClick={() => showBadgeDetail(nextAnswer, false)} aria-label={`Open ${nextAnswer.title} badge details`} /><BadgeMedallion badge={nextAnswer} earned={false} size="lg" /><div><span>NEXT BADGE</span><h2 id="answer-quest-heading">{nextAnswer.title}</h2><p>{answerRemainder === 0 ? "10 correct answers to earn it." : `${10 - answerRemainder} more correct ${10 - answerRemainder === 1 ? "answer" : "answers"}.`}</p><div className="badge-next-meter"><i role="progressbar" aria-label="Progress to next badge" aria-valuemin={0} aria-valuemax={10} aria-valuenow={answerRemainder}><b style={{ width: `${answerRemainder * 10}%` }} /></i></div></div></> : <><div className="vault-complete-glyph">✓</div><div><span>ANSWER BADGES</span><h2 id="answer-quest-heading">All earned.</h2></div></>}
        </section>

        <section className="badge-catalog-section" aria-label="Badge collection">
          <div className="badge-filter-bar" role="group" aria-label="Filter badges">
            {([['earned', 'Earned'], ['all', 'All'], ['lesson', 'Lessons'], ['answer', 'Answers']] as Array<[BadgeFilter, string]>).map(([value, label]) => <button className={filter === value ? "active" : ""} type="button" aria-pressed={filter === value} onClick={() => chooseFilter(value)} key={value}>{label}</button>)}
          </div>
          <div className="badge-catalog-grid">{shown.map((badge, badgeIndex) => {
            const owned = earned.has(badge.id);
            const firstNewBadge = revealedPage > 0 && badgeIndex === (revealedPage * 48);
            return <article ref={firstNewBadge ? firstNewBadgeRef : undefined} className={`badge-catalog-card accent-${badge.tone} ${owned ? "earned" : "locked"} ${firstNewBadge ? "learning-content-start" : ""}`} tabIndex={firstNewBadge ? -1 : undefined} aria-label={`${badge.title}: ${owned ? "earned" : badge.requirement}`} key={badge.id}><button className="progress-detail-hitarea" type="button" onClick={() => showBadgeDetail(badge, owned)} aria-label={`Open ${badge.title} badge details`} /><BadgeMedallion badge={badge} earned={owned} size="md" /><div className="badge-card-copy"><h3>{badge.title}</h3>{!owned && <p>{badge.requirement}</p>}</div></article>;
          })}</div>
          {visibleCount < filtered.length && <button className="secondary-button badge-show-more" type="button" onClick={showMore}>Show more <span aria-hidden="true">↓</span></button>}
          {!shown.length && <div className="badge-empty-filter"><span aria-hidden="true">◇</span><strong>No badges yet.</strong><p>Complete a lesson to earn your first.</p></div>}
        </section>
      </section>
      {detail && <ProgressDetailModal detail={detail} onClose={() => setDetail(null)} />}
    </main>
  );
}

function formatBadgeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
