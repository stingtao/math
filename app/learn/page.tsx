import { LearningDashboard } from "../components/LearningDashboard";

export const dynamic = "force-dynamic";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ demo?: string; grade?: string }> }) {
  const params = await searchParams;
  const grade = [7, 8, 9, 10, 11, 12].includes(Number(params.grade)) ? Number(params.grade) : 8;
  return <LearningDashboard demo={params.demo === "1"} grade={grade} />;
}
