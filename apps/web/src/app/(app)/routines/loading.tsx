import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-14 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-2 backdrop-blur-xl">
        <SidebarTrigger className="md:hidden" />
        <div><h1 className="text-lg font-bold leading-none">Routines</h1><h2 className="text-xs text-muted-foreground">Reusable workout templates for your training.</h2></div>
      </header>
      <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm md:p-5">
        <div className="flex justify-end border-b border-border/70 bg-background/30 p-2"><Skeleton className="h-9 w-64" /></div>
        <div className="grid gap-4 p-3 md:grid-cols-2 xl:grid-cols-3 md:p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="rounded-2xl border border-border/70 p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-8 h-4 w-1/2" /></div>)}</div>
      </section>
    </main>
  );
}
