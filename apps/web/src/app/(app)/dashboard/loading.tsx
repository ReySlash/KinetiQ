import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 pb-13 md:px-2 md:pb-2">
      <PageHeader subtitle="Your next workout and recent training at a glance.">
        <h1 className="text-lg font-bold leading-none">Dashboard</h1>
      </PageHeader>
      <section className="grid gap-2 p-1 xl:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-28 rounded-xl xl:col-span-2" />
      </section>
    </main>
  );
}
