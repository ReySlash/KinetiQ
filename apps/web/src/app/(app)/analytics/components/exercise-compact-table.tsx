import StyledLink from "@/components/styled-link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ExerciseFrequencySummary } from "@/types/analytics-types";
import { formatLoad } from "./analytics-formatters";

export function ExerciseCompactTable({ exercises }: { exercises: ExerciseFrequencySummary[] }) {
  return <Table className="table-fixed text-xs"><TableHeader><TableRow><TableHead className="w-[50%] px-2">Exercise</TableHead><TableHead className="px-2 text-right">Sets</TableHead><TableHead className="px-2 text-right">Reps</TableHead><TableHead className="px-2 text-right">Max</TableHead></TableRow></TableHeader><TableBody>{exercises.map((exercise) => <TableRow key={exercise.exerciseId}><TableCell className="max-w-0 truncate px-2"><Tooltip><TooltipTrigger render={<span className="block max-w-full truncate" />}><StyledLink href={`/exercises/${exercise.exerciseSlug}`} variant="link" className="block h-auto truncate p-0 text-left font-medium">{exercise.exerciseNameSnapshot}</StyledLink></TooltipTrigger><TooltipContent>Open {exercise.exerciseNameSnapshot} details</TooltipContent></Tooltip></TableCell><TableCell className="px-2 text-right tabular-nums">{exercise.completedWorkingSetCount}</TableCell><TableCell className="px-2 text-right tabular-nums">{exercise.totalRepetitions}</TableCell><TableCell className="px-2 text-right tabular-nums">{formatLoad(exercise.maximumLoadKg)}</TableCell></TableRow>)}</TableBody></Table>;
}
