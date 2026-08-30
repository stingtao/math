import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AdUnit } from "./components/AdUnit";
import { SiteFooter } from "./components/SiteFooter";
import { NavigationFeedback } from "./components/NavigationFeedback";

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
  const title = "Math — Build the worlds no one has reached yet.";
  const description = "Launch a 6–8 minute math mission. Settle Mars, engineer an ocean city, and explore the unknown through examples, practice, corrections, and bosses.";
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
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      </head>
      <body
        className={`${manrope.variable} antialiased`}
        suppressHydrationWarning
      >
        <NavigationFeedback />
        <div className="page-content google-anno-skip">{children}</div>
        <AdUnit />
        <SiteFooter />
      </body>
    </html>
  );
}
