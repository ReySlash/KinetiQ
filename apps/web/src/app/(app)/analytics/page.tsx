import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import {
  AnalyticsDashboard,
  AnalyticsLoading,
} from "./components/analytics-dashboard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 md:gap-1 md:px-1 md:pt-0">
      <PageHeader subtitle="Understand your training history.">
        <h1 className="text-lg font-bold leading-none">Analytics</h1>
      </PageHeader>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<AnalyticsLoading />}>
          <AnalyticsDashboard />
        </Suspense>
      </section>
    </main>
  );
}
