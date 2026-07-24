import { MuscleSkeletonCard } from "@/components/muscle-skeleton-card";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
        <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-9 xl:grid-cols-4 justify-between gap-auto rounded-3xl border border-border/70 bg-card/80 shadow-sm h-full">
          <MuscleSkeletonCard />
        </section>
      </main>
    </>
  );
}
