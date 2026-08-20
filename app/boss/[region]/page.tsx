import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BossPlayer } from "@/app/components/BossPlayer";
import { getRegion, regions } from "@/lib/curriculum";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return regions.map((region) => ({ region: String(region.id) })); }

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region: id } = await params;
  const region = getRegion(Number(id));
  if (!region) return { title: "Quest not found · Math" };
  const title = `${region.title} Boss Quest · Math`;
  const description = `Connect four skills from ${region.title} in a calm, untimed challenge.`;
  return { title, description, openGraph: { title, description, images: [] }, twitter: { title, description, images: [] } };
}

export default async function BossPage({ params, searchParams }: { params: Promise<{ region: string }>; searchParams: Promise<{ demo?: string }> }) {
  const [{ region: id }, query] = await Promise.all([params, searchParams]);
  const region = getRegion(Number(id));
  if (!region) notFound();
  return <BossPlayer region={region} demo={query.demo === "1"} />;
}
