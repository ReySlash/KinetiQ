"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnalyticsOverview } from "@/types/analytics-types";
import { formatNumber, formatVolume } from "./analytics-formatters";
import { exerciseMetricValue, orderExercisesByMetric, type ExerciseSortMetric } from "./exercise-analytics-utils";
import { exerciseMetricLabels } from "./analytics-ui";

export function ExerciseDistributionPanel({ overview, metric }: { overview: AnalyticsOverview; metric: ExerciseSortMetric }) {
  const [showAll, setShowAll] = useState(false);
  const exercises = orderExercisesByMetric(overview.exercises, metric);
  const allData = exercises.map((exercise) => ({ id: exercise.exerciseId, name: exercise.exerciseNameSnapshot, value: exerciseMetricValue(exercise, metric) })).filter((exercise) => exercise.value > 0);
  const visibleData = showAll ? allData : allData.slice(0, 5);
  const otherValue = showAll ? 0 : allData.slice(5).reduce((sum, exercise) => sum + exercise.value, 0);
  const total = allData.reduce((sum, exercise) => sum + exercise.value, 0);
  const chartData = otherValue > 0 ? [...visibleData, { id: "other", name: "Other", value: otherValue }] : visibleData;
  const maxValue = chartData[0]?.value ?? 0;

  return <Card className="min-w-0"><CardHeader><CardTitle>Exercise distribution</CardTitle><CardDescription>{exerciseMetricLabels[metric]} by exercise.</CardDescription>{allData.length > 5 && <CardAction><Tooltip><TooltipTrigger render={<Button variant="outline" size="sm" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show top five" : "Show all"}</Button>} /><TooltipContent>{showAll ? "Collapse to the top five exercises" : "Show every exercise"}</TooltipContent></Tooltip></CardAction>}</CardHeader><CardContent>{chartData.length === 0 ? <p className="py-8 text-sm text-muted-foreground">No {exerciseMetricLabels[metric].toLowerCase()} recorded for this period.</p> : <div className="grid gap-3">{chartData.map((exercise) => <div key={exercise.id} className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)_auto] items-center gap-2 text-sm"><span className="min-w-0 truncate">{exercise.name}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(exercise.value / maxValue) * 100}%` }} /></div><span className="min-w-12 text-right tabular-nums text-muted-foreground">{((exercise.value / total) * 100).toFixed(0)}% <span className="sr-only">{metric === "volume" ? formatVolume(String(exercise.value)) : formatNumber(exercise.value)}</span></span></div>)}<p className="text-xs text-muted-foreground">Total {exerciseMetricLabels[metric].toLowerCase()}: {metric === "volume" ? formatVolume(String(total)) : formatNumber(total)}</p></div>}</CardContent></Card>;
}
