"use client";

import Link from "next/link";
import { History } from "lucide-react";
import type { RoutineListItem } from "@/types/routine-types";
import type { WorkoutSessionListItem } from "@/types/workout-session-types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkoutSessionFilters } from "./workout-session-filters";
import { StartWorkoutDialog } from "./start-workout-dialog";

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
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
      <div className="flex flex-col gap-1 border-b border-border/70 bg-background/30 p-1 md:flex-row md:items-center md:justify-between md:p-2">
        <div className="w-full md:order-2 md:w-[min(100%,38rem)]">
          <WorkoutSessionFilters />
        </div>
        <div className="flex justify-center gap-2 md:order-1 md:w-auto md:justify-start">
          <StartWorkoutDialog routines={routines} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
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
          <div className="grid gap-2 md:gap-3 md:grid-cols-2 xl:grid-cols-3">
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
