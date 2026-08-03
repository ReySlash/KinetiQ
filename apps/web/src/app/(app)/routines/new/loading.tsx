import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="flex h-dvh w-full flex-col gap-4 p-3 md:p-6"><Skeleton className="h-16 w-full" /><Skeleton className="h-96 w-full" /></main>;
}
