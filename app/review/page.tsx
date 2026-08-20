import type { Metadata } from "next";
import { ReviewPlayer } from "../components/ReviewPlayer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Daily Review · Math", description: "A calm five-minute spaced review of the ideas that need one more visit." };

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  return <ReviewPlayer demo={params.demo === "1"} />;
}
