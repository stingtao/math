import type { Metadata } from "next";
import { FamilySafetyPage } from "../components/FamilySafetyPage";

export const metadata: Metadata = {
  title: "Private Family Progress · Math",
  description: "Math uses private family progress instead of public rankings.",
};

export default function LeaderboardPage() { return <FamilySafetyPage kind="league" />; }
