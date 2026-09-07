import { Badge } from "@/components/ui/badge";
import type { AnalyticsVolumeCompleteness } from "@/types/analytics-types";
import { volumeStatusLabel } from "./analytics-formatters";

export function VolumeBadge({ completeness }: { completeness: AnalyticsVolumeCompleteness }) {
  return <Badge variant={completeness.status === "COMPLETE" ? "secondary" : completeness.status === "PARTIAL" ? "outline" : "destructive"}>{volumeStatusLabel(completeness)}</Badge>;
}
