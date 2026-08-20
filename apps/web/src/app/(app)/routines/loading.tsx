import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Reusable workout templates for your training.">
        <h1 className="text-lg font-bold leading-none">Routines</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
        <div className="flex justify-end border-b border-border/70 bg-background/30 p-2"><Skeleton className="h-9 w-64" /></div>
        <div className="grid gap-4 p-3 md:grid-cols-2 xl:grid-cols-3 md:p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="rounded-xl border border-border/70 p-4 md:rounded-2xl md:p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-8 h-4 w-1/2" /></div>)}</div>
      </section>
    </main>
  );
}
