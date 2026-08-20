import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-14 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <header className="sticky top-0 z-100 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <SidebarTrigger className="md:hidden" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight">
            Muscle Groups
          </h1>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <section className="grid gap-6 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <span className="text-primary">KinetiQ</span>
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Reference library scaffold
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            The sidebar is now wired for the app shell. Muscles, exercises, and
            routines will land in this workspace as the next slices ship.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 transition-colors hover:border-primary/40">
            <p className="font-medium">Seeded muscles</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Public muscle pages and filters come next.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 transition-colors hover:border-primary/40">
            <p className="font-medium">Exercise library</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Identity, classifications, and assignments follow.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
