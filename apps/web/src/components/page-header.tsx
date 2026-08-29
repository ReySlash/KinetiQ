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
        "flex h-14 w-full shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-2 backdrop-blur-xl md:h-16 md:gap-3 md:px-3",
        sticky && "sticky top-0 z-30",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-row flex-nowrap items-center gap-2 overflow-hidden [&>a]:min-w-0 [&>a]:truncate [&>h1]:min-w-0 [&>h1]:truncate [&>nav]:min-w-0">
          {children}
        </div>
        <h2 className="truncate text-xs text-muted-foreground/80">{subtitle}</h2>
      </div>
    </header>
  );
}
