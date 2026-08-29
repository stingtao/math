import type { Metadata } from "next";
import { AboutPage } from "../components/AboutPage";

export const metadata: Metadata = {
  title: "About · Math",
  description: "How Math uses human and AI collaboration, welcomes open reuse, and learns from corrections.",
};

export default function About() {
  return <AboutPage />;
}
