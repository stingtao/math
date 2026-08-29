import type { Metadata } from "next";
import { BadgeGallery } from "../components/BadgeGallery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Badges · Math", description: "See the badges you have earned and the next badge within reach." };

export default async function BadgesPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  return <BadgeGallery demo={params.demo === "1"} />;
}
