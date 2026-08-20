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
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">{children}</div>
        <h2 className="text-xs text-muted-foreground/80">{subtitle}</h2>
      </div>
    </header>
  );
}
