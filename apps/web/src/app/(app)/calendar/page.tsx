import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm md:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
        Calendar
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Calendar placeholder
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        This route is wired and ready for the calendar implementation.
      </p>
      </section>
    </main>
  );
}
