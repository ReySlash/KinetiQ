import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { fetchAnalyticsOverviewServer } from "@/lib/analytics-server";
import { buildAnalyticsRequest } from "@/lib/analytics-range";
import { ApiError } from "@/lib/api/error";
import { getServerTimezone } from "@/lib/timezone-server";
import type { AnalyticsRange } from "@/types/analytics-types";
import type { ExerciseSortMetric } from "./components/exercise-analytics-utils";
import { AnalyticsDashboard, AnalyticsLoading } from "./components/analytics-dashboard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AnalyticsPage({ searchParams }: {
  searchParams: Promise<{ range?: string; metric?: string }>;
}) {
  const [{ range: value, metric: metricValue }, timezone] = await Promise.all([
    searchParams,
    getServerTimezone(),
  ]);
  const range: AnalyticsRange = ["1w", "2w", "4w", "26w", "52w"].includes(value ?? "")
    ? (value as AnalyticsRange)
    : "4w";
  const metric: ExerciseSortMetric = ["sets", "repetitions", "volume"].includes(
    metricValue ?? "",
  )
    ? (metricValue as ExerciseSortMetric)
    : "volume";
  let overview = null;
  let failure: { status: number; message: string } | undefined;

  if (timezone) {
    const request = buildAnalyticsRequest(timezone, { range });
    if (request.ok) {
      try {
        overview = await fetchAnalyticsOverviewServer(request.request);
      } catch (error) {
        failure = error instanceof ApiError
          ? { status: error.status, message: error.message }
          : { status: 500, message: "Analytics could not be loaded." };
      }
    }
  }

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 md:gap-1 md:px-1 md:pt-0">
      <PageHeader subtitle="Understand your training history.">
        <h1 className="text-lg font-bold leading-none">Analytics</h1>
      </PageHeader>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {timezone ? (
          <AnalyticsDashboard
            overview={overview}
            range={range}
            metric={metric}
            timezone={timezone}
            failure={failure}
          />
        ) : (
          <AnalyticsLoading />
        )}
      </section>
    </main>
  );
}
