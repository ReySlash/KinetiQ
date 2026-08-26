"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { startWorkout } from "@/lib/workout-sessions-api";
import type { RoutineListItem } from "@/types/routine-types";
import type { WorkoutSessionListItem } from "@/types/workout-session-types";
import StyledLink from "@/components/styled-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutSessionFilters } from "./workout-session-filters";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sessionLabel(status: WorkoutSessionListItem["status"]) {
  return status === "IN_PROGRESS" ? "In progress" : status.toLowerCase();
}

export function WorkoutSessionsLibrary({
  sessions,
  routines,
}: {
  sessions: WorkoutSessionListItem[];
  routines: RoutineListItem[];
}) {
  const router = useRouter();
  const [routineSlug, setRoutineSlug] = useState("freestyle");
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  async function handleStart() {
    setIsStarting(true);
    setStartError(null);
    try {
      const response = await startWorkout({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(routineSlug !== "freestyle" ? { routineSlug } : {}),
      });
      router.push(`/workout-sessions/${response.id}`);
    } catch (error) {
      setStartError(
        error instanceof Error ? error.message : "Unable to start the workout.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-border/70 bg-background/30 p-3 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,18rem)_auto] sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor="workout-routine">Start from a routine</Label>
            <Select
              value={routineSlug}
              onValueChange={(value) => setRoutineSlug(value ?? "freestyle")}
            >
              <SelectTrigger
                id="workout-routine"
                aria-label="Start from a routine"
              >
                <SelectValue placeholder="Freestyle workout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freestyle">Freestyle workout</SelectItem>
                {routines.map((routine) => (
                  <SelectItem key={routine.slug} value={routine.slug}>
                    {routine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full max-w-md justify-center gap-2 md:w-auto md:max-w-none md:justify-end">
          <Button
            onClick={() => void handleStart()}
            disabled={isStarting}
            size="lg"
            className="min-w-0 flex-1 md:flex-none md:px-4 hover:cursor-pointer"
          >
            {routineSlug !== "freestyle" ? <Play /> : <Plus />}
            {isStarting
              ? "Starting…"
              : routineSlug !== "freestyle"
                ? "Start workout"
                : "Start empty workout"}
          </Button>
          <StyledLink
            href="/routines"
            variant="outline"
            size="lg"
            className="min-w-0 flex-1 md:flex-none md:px-4"
          >
            Manage routines
          </StyledLink>
        </div>
      </div>
      {startError && (
        <p
          role="alert"
          className="border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {startError}
        </p>
      )}
      <WorkoutSessionFilters />
      <div className="min-h-0 flex-1 overflow-auto p-3 md:p-5">
        {sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <History className="size-6 text-primary" />
              <div>
                <p className="font-medium">No workouts yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start a routine or a freestyle workout to build your history.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/workout-sessions/${session.id}`}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>
                          {session.sourceRoutineNameSnapshot ??
                            "Freestyle workout"}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(session.startedAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          session.status === "COMPLETED"
                            ? "secondary"
                            : session.status === "IN_PROGRESS"
                              ? "default"
                              : "outline"
                        }
                      >
                        {sessionLabel(session.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between text-sm text-muted-foreground">
                    <span>{session.completedSetCount} sets</span>
                    <span>
                      {session.completedAt
                        ? formatDate(session.completedAt)
                        : "Continue workout"}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
