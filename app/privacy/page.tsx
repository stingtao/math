import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = { title: "Family Privacy Notice · Math", description: "How Math keeps one parent-held family learning record private, without child accounts, advertising, or public rankings." };
export default function PrivacyPage() { return <LegalPage kind="privacy" />; }
