import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ExerciseDetailsPage() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-hidden px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore our exercise&apos;s catalog.">
        <span className="text-lg font-bold leading-none">Exercises</span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
        <Skeleton className="h-5 w-36" />
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto space-y-2 rounded-lg md:rounded-2xl">
        <Card className="p-2 col-span-1 w-full aspect-square">
          <CardContent className="relative h-full aspect-square">
            <Skeleton className="w-full aspect-square" />
          </CardContent>
        </Card>

        <Card className="flex flex-col gap-6">
          <CardHeader>
            <Skeleton className="w-1/3 h-8" />
            <Skeleton className="w-1/2 h-10" />
            <Skeleton className="w-full h-20" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </CardContent>
        </Card>

        <Card className="flex flex-col gap-6">
          <CardHeader>
            <Skeleton className="w-1/3 h-8" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </CardContent>
        </Card>
        <Card className="flex flex-col gap-6">
          <CardHeader className="flex flex-row justify-between">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-1/3 h-6" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
