import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}