import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <main className="h-full w-full flex flex-col gap-2 p-1 md:p-2">
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60">
        <SidebarTrigger />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <section className="grid gap-6 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            KinetiQ
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Reference library scaffold
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            The sidebar is now wired for the app shell. Muscles, exercises, and
            routines will land in this workspace as the next slices ship.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="font-medium">Seeded muscles</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Public muscle pages and filters come next.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background p-4">
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
