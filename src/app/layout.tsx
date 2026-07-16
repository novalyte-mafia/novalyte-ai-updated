import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AnalyticsManager } from "@/components/site/analytics-manager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://novalyte.io"),
  title: "Novalyte AI — The Operating System for Men's Health",
  description:
    "Novalyte AI connects patient demand, verified clinics, specialized healthcare professionals, equipment suppliers, and operational services through one intelligent healthcare ecosystem.",
  keywords: [
    "men's health", "healthcare technology", "clinic directory", "TRT",
    "medical weight loss", "telehealth", "healthcare workforce", "men's health marketplace",
  ],
  authors: [{ name: "Novalyte AI" }],
  openGraph: {
    title: "Novalyte AI — The Operating System for Men's Health",
    description:
      "One intelligent healthcare ecosystem connecting patients, clinics, professionals, and suppliers.",
    siteName: "Novalyte AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novalyte AI",
    description: "The Operating System for Men's Health",
  },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <AnalyticsManager />
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
