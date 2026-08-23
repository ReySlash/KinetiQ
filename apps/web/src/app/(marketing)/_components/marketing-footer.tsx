import Link from "next/link";

const footerLinks = [
  { href: "/exercises", label: "Exercises" },
  { href: "/muscle-groups", label: "Muscles" },
  { href: "/training-programs", label: "Programs" },
  { href: "#about", label: "About" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <div className="text-center md:text-left">
          <Link href="/" className="text-lg font-semibold tracking-[0.16em]" aria-label="KinetiQ home">
            <span className="text-primary">KINET</span>IQ
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            Structured training, clearer progress.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-center text-xs text-muted-foreground md:text-right">
          <p>© {new Date().getFullYear()} KinetiQ</p>
          <p className="mt-2">
            Created by{" "}
            <a
              href="https://reyslash.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
            >
              Reynaldo Carmenate Arias
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
