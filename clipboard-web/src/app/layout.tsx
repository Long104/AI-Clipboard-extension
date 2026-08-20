import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Clipboard — Copy & Understand for Chrome",
  description:
    "Instant AI explanations and summaries on any webpage with macOS-style Look Up, clipboard history, and a side panel. Free, private, and fast.",
  openGraph: {
    title: "AI Clipboard — Copy & Understand for Chrome",
    description:
      "Instant AI explanations and summaries on any webpage without switching tabs.",
    url: "/",
    siteName: "AI Clipboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
