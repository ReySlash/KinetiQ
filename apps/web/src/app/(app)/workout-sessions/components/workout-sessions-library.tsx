"use client";

import { History } from "lucide-react";
import ImageWithFallback from "@/components/image-with-fallback";
import { MoreLink } from "@/components/more-link";
import type { RoutineListItem } from "@/types/routine-types";
import type { WorkoutSessionListItem } from "@/types/workout-session-types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkoutSessionFilters } from "./workout-session-filters";
import { StartWorkoutDialog } from "./start-workout-dialog";
import { WorkoutProgramLink } from "./workout-program-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sessionLabel(status: WorkoutSessionListItem["status"]) {
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "COMPLETED") return "Completed";
  return "Cancelled";
}

function sessionBadgeClassName(status: WorkoutSessionListItem["status"]) {
  if (status === "COMPLETED") {
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
  }

  if (status === "CANCELLED") {
    return "border-red-500/30 bg-red-500/15 text-red-400";
  }

  return "border-primary/30 bg-primary/15 text-primary";
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
      <div className="flex flex-col gap-1 border-b border-border/70 bg-background/30 p-1 md:flex-row md:items-start md:justify-between md:p-2">
        <div className="w-full md:order-2 md:w-[min(100%,38rem)]">
          <WorkoutSessionFilters />
        </div>
        <div className="hidden justify-center gap-2 md:order-1 md:flex md:w-auto md:justify-start">
          <StartWorkoutDialog routines={routines} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-1 pb-16 md:p-2">
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
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workout</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sets</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <ImageWithFallback
                          className="rounded-xl border"
                          src="/empty-state-exercises.webp"
                          alt="Workout cover"
                          width={70}
                          height={70}
                          fallbackSrc="/empty-state-exercises.webp"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{session.sourceRoutineNameSnapshot ?? "Freestyle workout"}</span>
                          <WorkoutProgramLink provenance={session.provenance} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`min-w-20 justify-center ${sessionBadgeClassName(session.status)}`}
                        >
                          {sessionLabel(session.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.completedSetCount}</TableCell>
                      <TableCell>{formatDate(session.startedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <MoreLink
                            href={`/workout-sessions/${session.id}`}
                            tooltip="Open workout details"
                            ariaLabel={`Open ${session.sourceRoutineNameSnapshot ?? "freestyle workout"}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-2 md:hidden">
              {sessions.map((session) => (
                <Card key={session.id} className="w-full py-1 transition-colors hover:border-primary/50">
                  <CardContent className="flex flex-row items-center justify-between gap-2 px-1">
                    <ImageWithFallback
                      className="rounded-xl"
                      src="/empty-state-exercises.webp"
                      alt="Workout cover"
                      width={70}
                      height={70}
                      fallbackSrc="/empty-state-exercises.webp"
                    />
                    <div className="min-w-0 flex-1 text-center">
                      <CardTitle className="truncate">
                        {session.sourceRoutineNameSnapshot ?? "Freestyle workout"}
                      </CardTitle>
                      <CardDescription>
                        {session.completedSetCount} sets · {sessionLabel(session.status)}
                      </CardDescription>
                      <WorkoutProgramLink provenance={session.provenance} className="block truncate text-xs text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`min-w-20 justify-center ${sessionBadgeClassName(session.status)}`}
                      >
                        {sessionLabel(session.status)}
                      </Badge>
                      <MoreLink
                        href={`/workout-sessions/${session.id}`}
                        tooltip="Open workout details"
                        ariaLabel={`Open ${session.sourceRoutineNameSnapshot ?? "freestyle workout"}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="fixed inset-x-2 bottom-14 z-30 flex justify-center md:hidden">
        <StartWorkoutDialog routines={routines} />
      </div>
    </section>
  );
}
