"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExerciseFrequencySummary } from "@/types/analytics-types";
import { orderExercisesByMetric, type ExerciseSortMetric } from "./exercise-analytics-utils";
import { ExerciseCompactTable } from "./exercise-compact-table";
import { ExerciseRow } from "./exercise-row";

export function ExercisePanel({ exercises, timezone, metric }: { exercises: ExerciseFrequencySummary[]; timezone: string; metric: ExerciseSortMetric }) {
  const ordered = orderExercisesByMetric(exercises, metric);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? ordered : ordered.slice(0, 5);
  return <Card className="min-w-0"><CardHeader><CardTitle>Top exercises</CardTitle><CardDescription>Ranked by completed {metric === "volume" ? "volume" : metric === "sets" ? "working sets" : "repetitions"}.</CardDescription>{ordered.length > 5 && <CardAction><Tooltip><TooltipTrigger render={<Button variant="outline" size="sm" onClick={() => setExpanded((value) => !value)}>{expanded ? "Show top five" : "Show all"}</Button>} /><TooltipContent>{expanded ? "Collapse to the top five exercises" : "Show every exercise"}</TooltipContent></Tooltip></CardAction>}</CardHeader><CardContent><div className="hidden overflow-x-auto lg:block"><Table><TableHeader><TableRow><TableHead>Exercise</TableHead><TableHead>Sets</TableHead><TableHead>Reps</TableHead><TableHead>Maximum</TableHead><TableHead>Last set</TableHead></TableRow></TableHeader><TableBody>{visible.map((exercise) => <ExerciseRow key={exercise.exerciseId} exercise={exercise} timezone={timezone} />)}</TableBody></Table></div><div className="lg:hidden"><ExerciseCompactTable exercises={visible} /></div></CardContent></Card>;
}
