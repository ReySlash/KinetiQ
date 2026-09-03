import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="Follow your program and keep every workout connected.">
        <h1 className="text-lg leading-none font-bold">Training program</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-hidden rounded-lg md:rounded-2xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-2">
          <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent className="flex flex-col gap-3"><Skeleton className="h-2 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent className="flex flex-col gap-2"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></CardContent></Card>
        </div>
      </section>
    </main>
  );
}
