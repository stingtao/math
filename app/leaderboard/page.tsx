import type { Metadata } from "next";
import { LeaderboardView } from "../components/LeaderboardView";

export const metadata: Metadata = {
  title: "Anonymous Weekly League · Math",
  description: "An anonymous weekly Grades 7–9 learning league using random nicknames and abstract avatars.",
};

export default function LeaderboardPage() { return <LeaderboardView />; }
