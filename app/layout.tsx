import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import "katex/dist/katex.min.css";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Math — Grades 7–9";
  const description = "Short English math lessons, worked examples, practice, review, and anonymous progress for Grades 7–9.";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "Math learning site for Grades 7–9" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
