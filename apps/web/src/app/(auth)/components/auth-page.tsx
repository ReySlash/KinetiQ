import Link from "next/link";

export function AuthPage({
  title,
  description,
  alternateText,
  alternateHref,
  alternateLabel,
  children,
}: {
  title: string;
  description: string;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-auto px-5 py-10">
      <section className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            <span className="text-primary">Kineti</span>Q
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-black/5 md:p-8">
          {children}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {alternateText}{" "}
          <Link href={alternateHref} className="font-medium text-primary hover:underline">
            {alternateLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
