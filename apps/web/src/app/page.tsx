export default function Home() {
  return (
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
  );
}
