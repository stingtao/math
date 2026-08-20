import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/app/components/LessonPlayer";
import { getLesson, lessons } from "@/lib/curriculum";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found · Math" };
  const title = `${lesson.title} · Math`;
  const description = lesson.goal;
  return { title, description, openGraph: { title, description, images: [] }, twitter: { title, description, images: [] } };
}

export default async function LessonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ demo?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} demo={query.demo === "1"} />;
}
