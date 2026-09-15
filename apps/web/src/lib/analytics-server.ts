import { serverRequest } from "@/lib/api/server-request";
import type { AnalyticsOverview } from "@/types/analytics-types";
import type { AnalyticsOverviewRequest } from "@/types/analytics-types";

export function fetchAnalyticsOverviewServer(
  request: AnalyticsOverviewRequest,
): Promise<AnalyticsOverview> {
  const params = new URLSearchParams({ timezone: request.timezone });
  if (request.from) params.set("from", request.from);
  if (request.to) params.set("to", request.to);
  return serverRequest<AnalyticsOverview>(`analytics/overview?${params.toString()}`);
}
