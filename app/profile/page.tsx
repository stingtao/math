import type { Metadata } from "next";
import { ProfileView } from "../components/ProfileView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Anonymous Profile · Math", description: "Manage your anonymous Math identity, rewards, and privacy settings." };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  return <ProfileView demo={params.demo === "1"} clientId={process.env.GOOGLE_CLIENT_ID ?? ""} />;
}
