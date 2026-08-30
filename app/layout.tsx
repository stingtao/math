import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { NavigationFeedback } from "./components/NavigationFeedback";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f7f9",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Math — Learn together, one conversation at a time.";
  const description = "Short Grades 7–12 math sessions for a parent and child to explore side by side, with prompts that help adults ask, listen, and teach.";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg" },
    openGraph: { title, description, type: "website", images: [{ url: `${origin}/og-frontier-v1.webp`, width: 1200, height: 630, alt: "Teen explorers overlooking the first human settlement on Mars" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og-frontier-v1.webp`] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${manrope.variable} antialiased`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}><NavigationFeedback /></Suspense>
        <div className="page-content" tabIndex={-1}>{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
