import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AnalyticsManager } from "@/components/site/analytics-manager";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Novalyte AI — Find and Navigate Men's Health Care",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "men's health", "healthcare technology", "clinic directory", "TRT",
    "medical weight loss", "telehealth", "healthcare workforce", "men's health marketplace",
  ],
  authors: [{ name: "Novalyte AI" }],
  openGraph: {
    title: "Novalyte AI — Find and Navigate Men's Health Care",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: "Novalyte AI — men's health discovery and care navigation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novalyte AI — Find and Navigate Men's Health Care",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = [organizationJsonLd(), websiteJsonLd()];

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <AnalyticsManager />
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
