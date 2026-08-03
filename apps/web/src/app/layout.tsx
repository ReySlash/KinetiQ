import type { Metadata } from "next";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "KinetiQ",
  description:
    "Fitness development platform for exercises, routines, and training progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="h-full overflow-hidden bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <QueryProvider>{children}</QueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
