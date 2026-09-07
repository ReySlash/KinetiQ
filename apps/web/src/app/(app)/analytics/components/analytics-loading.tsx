import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsLoading() {
  return <div className="flex flex-col gap-3 p-2 pb-14 md:gap-4 md:p-3 md:pb-0"><Skeleton className="h-24" /><div className="grid grid-cols-1 gap-2 min-[340px]:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32" />)}</div><Skeleton className="h-20" /><div className="grid gap-3 xl:grid-cols-3"><Skeleton className="h-96 xl:col-span-2" /><Skeleton className="h-96" /></div><div className="grid gap-3 xl:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div>;
}
