import { AlertTriangle, CirclePlay, Play } from "lucide-react";
import Link from "next/link";

import StyledLink from "@/components/styled-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";
import type { WorkoutSession } from "@/types/workout-session-types";
import { formatDashboardDateTime } from "./dashboard-formatters";
import { DashboardRetryButton } from "./dashboard-retry-button";
import type { DashboardPrimaryAction } from "./dashboard-state";

function statusLabel(status: AdoptedTrainingProgram["status"]): string {
  return status[0] + status.slice(1).toLowerCase();
}

export function TrainingPlanCard({
  action,
  activeWorkout,
  activeProgram,
}: {
  action: DashboardPrimaryAction;
  activeWorkout: WorkoutSession | null;
  activeProgram: AdoptedTrainingProgram | null;
}) {
  if (action.kind === "retry") {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Training plan is unavailable</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>We could not confirm your next training action.</span>
          <DashboardRetryButton />
        </AlertDescription>
      </Alert>
    );
  }

  if (action.kind === "continue" && activeWorkout) {
    const workoutName =
      activeWorkout.sourceRoutineNameSnapshot ??
      activeWorkout.provenance.programRoutineNameSnapshot ??
      "Workout";
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="gap-2 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <CardDescription>Training plan</CardDescription>
            <Badge>In progress</Badge>
          </div>
          <CardTitle>Continue {workoutName}</CardTitle>
          <CardDescription>
            Started{" "}
            {formatDashboardDateTime(
              activeWorkout.startedAt,
              activeWorkout.timezone,
            )}
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Your active session is waiting.
          </span>
          <StyledLink href={`/workout-sessions/${action.workoutSessionId}`}>
            <CirclePlay data-icon="inline-start" />
            Continue workout
          </StyledLink>
        </CardContent>
      </Card>
    );
  }

  if (action.kind === "program" && activeProgram) {
    const nextOccurrence = activeProgram.nextPendingOccurrence;
    const isPaused = activeProgram.status === "PAUSED";
    const nextRoutineHref =
      !isPaused &&
      nextOccurrence?.sourceRoutineAvailable &&
      nextOccurrence.sourceRoutineSlug
        ? `/routines/${nextOccurrence.sourceRoutineSlug}`
        : null;
    return (
      <Card>
        <CardHeader className="gap-2 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <CardDescription>Training plan</CardDescription>
            <Badge variant={isPaused ? "secondary" : "default"}>
              {statusLabel(activeProgram.status)}
            </Badge>
          </div>
          <CardTitle>
            {isPaused ? (
              "Your program is paused"
            ) : nextOccurrence && nextRoutineHref ? (
              <Link
                href={nextRoutineHref}
                className="rounded-sm text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {nextOccurrence.routineNameSnapshot}
              </Link>
            ) : nextOccurrence ? (
              nextOccurrence.routineNameSnapshot
            ) : (
              "Review your active program"
            )}
          </CardTitle>
          <CardDescription>
            {isPaused
              ? "Resume from your program page when you are ready."
              : nextOccurrence
                ? `Next up · Week ${nextOccurrence.weekNumber}, day ${nextOccurrence.dayNumber}`
                : "Your adopted program has no pending occurrence."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Progress value={activeProgram.progressPercent}>
              <ProgressLabel>Program progress</ProgressLabel>
              <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                {Math.round(activeProgram.progressPercent)}%
              </span>
            </Progress>
            <p className="text-xs text-muted-foreground">
              {activeProgram.resolvedCount} of {activeProgram.totalCount}{" "}
              workouts resolved
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-end">
            {nextRoutineHref ? (
              <StyledLink href={nextRoutineHref}>
                <Play data-icon="inline-start" />
                Start workout
              </StyledLink>
            ) : null}
            <StyledLink
              href={`/training-programs/adopted/${action.adoptedTrainingProgramId}`}
              variant="outline"
              className={nextRoutineHref ? undefined : "col-span-2"}
            >
              Open active program
            </StyledLink>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-2 border-b border-border/60">
        <CardDescription>Training plan</CardDescription>
        <CardTitle>Ready when you are</CardTitle>
        <CardDescription>
          Start a workout or choose a program to follow over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:justify-center">
        <StyledLink href="/workout-sessions" className="w-full md:w-auto">
          <Play data-icon="inline-start" />
          New workout
        </StyledLink>
        <StyledLink
          href="/training-programs"
          variant="outline"
          className="w-full md:w-auto"
        >
          Explore programs
        </StyledLink>
      </CardContent>
    </Card>
  );
}
