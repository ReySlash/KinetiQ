import type { Metadata } from "next";
import "./globals.css";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-14 items-center gap-3 border-b border-border/60 px-4">
                  <SidebarTrigger />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold leading-none">
                      KinetiQ
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Reference workspace
                    </span>
                  </div>
                </header>
                <div className="flex-1 p-4">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
