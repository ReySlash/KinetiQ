import type { Metadata } from "next";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";
import { MobileBottomNav } from "@/app/(app)/_components/mobile-bottom-nav";
import { TimezoneSynchronizer } from "@/app/(app)/_components/timezone-synchronizer";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "KinetiQ — Structured Strength Training",
    template: "%s | KinetiQ",
  },
  description:
    "Fitness development platform for exercises, routines, and training progress.",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <TimezoneSynchronizer />
        <div className="h-dvh overflow-hidden">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
            <MobileBottomNav />
          </SidebarProvider>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
