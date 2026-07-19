import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Novalyte AI",
  description:
    "Learn how Novalyte AI helps patients navigate men's health clinics and helps clinics grow with verified directory and workforce tools.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Novalyte AI",
    description:
      "Learn how Novalyte AI helps patients navigate men's health clinics and helps clinics grow with verified directory and workforce tools.",
    type: "website",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
