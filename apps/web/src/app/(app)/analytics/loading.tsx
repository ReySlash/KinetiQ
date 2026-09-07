import { PageHeader } from "@/components/page-header";
import { AnalyticsLoading } from "./components/analytics-dashboard";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Understand your training history.">
        <h1 className="text-lg font-bold leading-none">Analytics</h1>
      </PageHeader>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card/30 shadow-sm md:rounded-2xl">
        <AnalyticsLoading />
      </section>
    </main>
  );
}
