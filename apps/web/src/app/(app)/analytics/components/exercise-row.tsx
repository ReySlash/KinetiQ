import StyledLink from "@/components/styled-link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ExerciseFrequencySummary } from "@/types/analytics-types";
import { formatLastSet, formatLoad } from "./analytics-formatters";

export function ExerciseRow({ exercise, timezone }: { exercise: ExerciseFrequencySummary; timezone: string }) {
  return <TableRow><TableCell><Tooltip><TooltipTrigger render={<span className="inline-flex max-w-full" />}><StyledLink href={`/exercises/${exercise.exerciseSlug}`} variant="link" className="h-auto truncate p-0 text-left">{exercise.exerciseNameSnapshot}</StyledLink></TooltipTrigger><TooltipContent>Open {exercise.exerciseNameSnapshot} details</TooltipContent></Tooltip><p className="text-xs text-muted-foreground">{exercise.completedWorkoutCount} workouts</p></TableCell><TableCell>{exercise.completedWorkingSetCount}</TableCell><TableCell>{exercise.totalRepetitions}</TableCell><TableCell>{formatLoad(exercise.maximumLoadKg)}</TableCell><TableCell>{formatLastSet(exercise, timezone)}</TableCell></TableRow>;
}
