import type { Metadata } from "next";
import { LeaderboardView } from "../components/LeaderboardView";

export const metadata: Metadata = {
  title: "Anonymous Weekly League · Math",
  description: "An anonymous weekly Grades 7–12 learning league using random nicknames and abstract avatars.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  return <LeaderboardView demo={params.demo === "1"} />;
}
