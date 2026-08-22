import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
        <div className="page-grain" aria-hidden />
      </body>
    </html>
  );
}
