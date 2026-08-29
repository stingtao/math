import type { Metadata } from "next";
import { AboutPage } from "../components/AboutPage";

export const metadata: Metadata = {
  title: "About · Math",
  description: "Why Sting built Math for his daughter—and why learning math should feel like an adventure.",
};

export default function About() {
  return <AboutPage />;
}
