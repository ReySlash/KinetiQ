import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  subtitle: string;
  sticky?: boolean;
  children: ReactNode;
};

export function PageHeader(props: PageHeaderProps) {
  const { subtitle, sticky = false, children } = props;
  return (
    <header
      className={cn(
        "flex h-16 w-full shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        sticky && "sticky top-0 z-30",
      )}
    >
      <SidebarTrigger className="md:hidden" />
      <div className="flex flex-col">
        <div className="flex flex-row gap-2">{children}</div>
        <h2 className="text-xs text-muted-foreground/80">{subtitle}</h2>
      </div>
    </header>
  );
}
