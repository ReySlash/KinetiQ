import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="Follow your current multi-week plan.">
        <h1 className="text-lg leading-none font-bold">Active program</h1>
      </PageHeader>
      <Card className="min-h-0 flex-1">
        <CardHeader><Skeleton className="h-6 w-44" /></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </main>
  );
}
