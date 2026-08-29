import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = { title: "Terms · Math", description: "Simple rules for using the Math Grades 7–12 learning website." };
export default function TermsPage() { return <LegalPage kind="terms" />; }
