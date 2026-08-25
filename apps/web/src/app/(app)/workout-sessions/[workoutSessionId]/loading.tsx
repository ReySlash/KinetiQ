import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pt-0"><PageHeader subtitle="Keep your workout moving."><h1 className="text-lg leading-none font-bold">Workout</h1></PageHeader><section className="min-h-0 flex-1 space-y-2 overflow-auto rounded-lg p-2 md:rounded-2xl md:p-4"><Skeleton className="h-28 w-full rounded-xl" /><Skeleton className="h-96 w-full rounded-xl" /></section></main>;
}
