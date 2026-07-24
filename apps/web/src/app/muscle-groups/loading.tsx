import { SidebarTrigger } from "@/components/ui/sidebar";
import { MuscleSkeletonCard } from "./components/muscle-skeleton-card";

export default async function Loading() {
  return (
    <>
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60 px-4">
        <SidebarTrigger />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <main className="h-full w-full p-2 md:p-3">
        <section className="@container grid gap-2 rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
          <MuscleSkeletonCard />
        </section>
      </main>
    </>
  );
}
