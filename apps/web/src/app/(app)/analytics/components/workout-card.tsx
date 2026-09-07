import StyledLink from "@/components/styled-link";
import type { RecentWorkoutSummary } from "@/types/analytics-types";
import { FactText } from "./fact-text";
import { formatDateTime, formatVolume } from "./analytics-formatters";
import { VolumeBadge } from "./volume-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function WorkoutCard({ workout, timezone }: { workout: RecentWorkoutSummary; timezone: string }) {
  return <div className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><div><Tooltip><TooltipTrigger render={<span className="inline-flex" />}><StyledLink href={`/workout-sessions/${workout.workoutSessionId}`} variant="link" className="h-auto p-0 text-left font-medium">{workout.displayName}</StyledLink></TooltipTrigger><TooltipContent>Open {workout.displayName} details</TooltipContent></Tooltip><p className="text-xs text-muted-foreground">{formatDateTime(workout.completedAt, timezone)}</p></div><VolumeBadge completeness={workout.volumeCompleteness} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-sm"><FactText label="Sets" value={workout.completedWorkingSetCount} /><FactText label="Reps" value={workout.totalRepetitions} /><FactText label="Volume" value={formatVolume(workout.volumeLoadKg)} /></div></div>;
}
