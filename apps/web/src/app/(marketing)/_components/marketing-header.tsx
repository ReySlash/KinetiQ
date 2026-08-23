import Link from "next/link";

import StyledLink from "@/components/styled-link";

const navigation = [
  { href: "#exercises", label: "Exercises" },
  { href: "#muscles", label: "Muscles" },
  { href: "#programs", label: "Programs" },
  { href: "#about", label: "About" },
] as const;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="KinetiQ home"
          className="shrink-0 text-lg font-semibold tracking-[0.16em] text-foreground"
        >
          <span className="text-primary">KINET</span>IQ
        </Link>

        <nav aria-label="Marketing navigation" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm text-muted-foreground">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <StyledLink
            href="/sign-in"
            variant="outline"
            size="sm"
            className="border-border/80 bg-background/60"
          >
            Log in
          </StyledLink>
          <StyledLink href="/sign-up" size="sm">
            Get started
          </StyledLink>
        </div>
      </div>
    </header>
  );
}
