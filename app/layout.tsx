import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AdUnit } from "./components/AdUnit";
import { SiteFooter } from "./components/SiteFooter";

const ADSENSE_CLIENT = "ca-pub-6452867962392355";

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
  const title = "Math — Small steps. Real progress.";
  const description = "Visual English math lessons, five focused practice checks, review, and gameful progress for Grades 7–12.";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: `${origin}/og-v2.png`, width: 1672, height: 941, alt: "Math — Small steps. Real progress. Grades 7–12" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og-v2.png`] },
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
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      </head>
      <body
        className={`${manrope.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="page-content">{children}</div>
        <AdUnit />
        <SiteFooter />
      </body>
    </html>
  );
}
