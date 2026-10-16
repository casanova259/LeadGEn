import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading-font",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans-font",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono-font",
  display: "swap",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}