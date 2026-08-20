import type { Metadata } from "next";
import { LeaderboardView } from "../components/LeaderboardView";

export const metadata: Metadata = {
  title: "Anonymous Weekly League · Math",
  description: "A privacy-first weekly Grade 8 learning league using random nicknames and abstract avatars.",
};

export default function LeaderboardPage() { return <LeaderboardView />; }
