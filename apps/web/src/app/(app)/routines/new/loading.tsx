import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";

export default function Loading() {
  return <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0"><PageHeader subtitle="Reusable workout templates for your training."><h1 className="text-lg font-bold leading-none">New routine</h1></PageHeader><section className="min-h-0 flex-1 space-y-2 overflow-auto rounded-lg md:rounded-2xl"><Skeleton className="h-40 w-full rounded-xl md:rounded-2xl" /><Skeleton className="h-96 w-full rounded-xl md:rounded-2xl" /></section></main>;
}
