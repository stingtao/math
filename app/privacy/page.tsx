import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = { title: "Privacy Promise · Math", description: "How Math keeps Google identity separate from learning progress and public weekly leagues." };
export default function PrivacyPage() { return <LegalPage kind="privacy" />; }
