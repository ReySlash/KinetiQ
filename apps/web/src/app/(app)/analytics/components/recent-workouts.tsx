import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentWorkoutSummary } from "@/types/analytics-types";
import { WorkoutCard } from "./workout-card";

export function RecentWorkouts({ workouts, timezone }: { workouts: RecentWorkoutSummary[]; timezone: string }) {
  return <Card><CardHeader><CardTitle>Recent workouts</CardTitle><CardDescription>The four latest completed sessions in this period.</CardDescription></CardHeader><CardContent className="grid gap-2">{workouts.length === 0 ? <p className="text-sm text-muted-foreground">No completed sessions in this period.</p> : workouts.map((workout) => <WorkoutCard key={workout.workoutSessionId} workout={workout} timezone={timezone} />)}</CardContent></Card>;
}
