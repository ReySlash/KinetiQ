import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pt-0">
      <PageHeader subtitle="Start, resume, and review your workouts.">
        <h1 className="text-lg leading-none font-bold">Workout sessions</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 space-y-2 overflow-auto rounded-lg border border-border/70 p-3 md:rounded-2xl md:p-5">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </main>
  );
}
