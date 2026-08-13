import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lost Leads — Stop losing leads you already paid for",
  description:
    "Lost Leads catches every new inquiry, auto-creates a follow-up task, and flags anyone you haven't contacted in 24 hours — so no lead falls through the cracks.",
  metadataBase: new URL("https://lost-leads.vercel.app"),
  openGraph: {
    title: "Lost Leads — Stop losing leads you already paid for",
    description:
      "Auto follow-up tasks, a Rescue Queue for hot leads, and a daily digest — built for clinics, salons, agencies & real estate teams.",
    url: "https://lost-leads.vercel.app",
    siteName: "Lost Leads",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lost Leads — Stop losing leads you already paid for",
    description:
      "Catch every lead, auto-create follow-up tasks, and rescue hot leads before they go cold.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/*
        NOTE: intentionally NOT forcing `dark` here at the root anymore.
        The landing page (app/page.tsx) is designed light/white.
        The logged-in app previously relied on <html className="dark">
        from this file — move that class onto app/(app)/layout.tsx instead
        (e.g. wrap its content in a `<div className="dark">` or add
        `className="dark"` to that route group's own top-level element)
        so only the dashboard renders dark, not the marketing site.
      */}
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}