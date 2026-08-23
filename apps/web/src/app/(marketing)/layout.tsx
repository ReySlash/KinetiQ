import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "KinetiQ — Structured Strength Training",
    template: "%s | KinetiQ",
  },
  description:
    "Fitness development platform for exercises, routines, and training progress.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark min-h-full antialiased">
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
