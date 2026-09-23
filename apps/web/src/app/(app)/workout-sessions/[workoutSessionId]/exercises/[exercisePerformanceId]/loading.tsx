import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-2 pb-13">
      <div className="grid gap-2 border-b border-border/70 py-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-3">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </main>
  );
}
