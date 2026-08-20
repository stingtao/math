import type { Metadata } from "next";
import { FeedbackBoard } from "../components/FeedbackBoard";

export const metadata: Metadata = { title: "Anonymous Feedback · Math", description: "Leave a public anonymous note about the Math learning site." };
export default function FeedbackPage() { return <FeedbackBoard />; }
