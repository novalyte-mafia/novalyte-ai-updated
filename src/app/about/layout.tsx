import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Novalyte AI | Men’s-Health Clinic Infrastructure",
  description:
    "Learn how Novalyte AI builds technology, discovery, workforce, and operational infrastructure that helps men’s-health clinics grow responsibly.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "The infrastructure behind modern men’s-health clinics",
    description:
      "Novalyte AI supports responsible clinic growth through coordinated discovery, workforce, intake, and operational infrastructure.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
