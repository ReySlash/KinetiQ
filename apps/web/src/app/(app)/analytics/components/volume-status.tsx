import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnalyticsVolumeCompleteness } from "@/types/analytics-types";
import { formatVolume } from "./analytics-formatters";
import { VolumeBadge } from "./volume-badge";

export function VolumeStatus({ completeness, value, compact = false }: { completeness: AnalyticsVolumeCompleteness; value?: string | null; compact?: boolean }) {
  return <Tooltip><TooltipTrigger render={<span className="inline-flex min-h-8 flex-wrap items-center gap-1.5" />}><VolumeBadge completeness={completeness} />{!compact && value !== undefined && <span className="text-sm">{formatVolume(value)}</span>}</TooltipTrigger><TooltipContent>{completeness.includedSetCount} included and {completeness.excludedSetCount} excluded working sets.</TooltipContent></Tooltip>;
}
