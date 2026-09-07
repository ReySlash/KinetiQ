import { clientRequest } from "@/lib/api/client-request";
import type { AnalyticsOverview } from "@/types/analytics-types";

export type AnalyticsOverviewRequest = {
  timezone: string;
  from?: string;
  to?: string;
};

export function fetchAnalyticsOverview(
  request: AnalyticsOverviewRequest,
): Promise<AnalyticsOverview> {
  const params = new URLSearchParams({ timezone: request.timezone });
  if (request.from) params.set("from", request.from);
  if (request.to) params.set("to", request.to);

  return clientRequest<AnalyticsOverview>(
    `analytics/overview?${params.toString()}`,
  );
}
