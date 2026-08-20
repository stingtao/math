import { LearningDashboard } from "../components/LearningDashboard";

export const dynamic = "force-dynamic";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  return <LearningDashboard demo={params.demo === "1"} />;
}
