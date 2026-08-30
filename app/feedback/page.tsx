import type { Metadata } from "next";
import { FeedbackBoard } from "../components/FeedbackBoard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Parent Feedback · Math", description: "Signed-in parents can send reviewed feedback and read responses from the site owner." };
export default function FeedbackPage() { return <FeedbackBoard />; }
