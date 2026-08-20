"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navigationItems } from "@/components/side-nav";
import { cn } from "@/lib/utils";

const primaryNavigation = navigationItems.filter(({ href }) =>
  ["/dashboard", "/exercises", "/routines", "/training-programs"].includes(
    href,
  ),
);

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex h-12 items-center justify-around border-t border-border/70 bg-background/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_oklch(0_0_0/0.12)] backdrop-blur-xl md:hidden"
    >
      {primaryNavigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-[9px] font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive && "bg-primary/15 text-primary",
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            <span className="max-w-20 truncate">{label}</span>
          </Link>
        );
      })}
      <SidebarTrigger
        aria-label="More navigation"
        className="flex size-auto min-w-14 flex-col gap-0.5 rounded-lg px-1.5 py-1 text-[9px] font-medium text-muted-foreground after:content-['More'] hover:bg-muted hover:text-foreground"
      />
    </nav>
  );
}
