import type { Metadata } from "next";
import { BadgeGallery } from "../components/BadgeGallery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Badge Vault · Math", description: "Browse your private collection of 500 lesson and Answer Quest badges." };

export default async function BadgesPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  return <BadgeGallery demo={params.demo === "1"} />;
}
