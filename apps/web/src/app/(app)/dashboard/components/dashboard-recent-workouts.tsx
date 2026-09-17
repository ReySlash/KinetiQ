import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreLink } from "@/components/more-link";
import type { RecentWorkoutSummary } from "@/types/analytics-types";
import {
  formatDashboardDateTime,
  formatDashboardNumber,
  formatDashboardVolume,
  workoutLabel,
} from "./dashboard-formatters";

export function DashboardRecentWorkouts({
  workouts,
  timezone,
}: {
  workouts: RecentWorkoutSummary[];
  timezone: string;
}) {
  const recentWorkouts = workouts.slice(0, 3);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Recent workouts</CardTitle>
            <CardDescription>
              Your three latest completed sessions.
            </CardDescription>
          </div>
          {recentWorkouts.length > 0 ? (
            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Link
                  href="/workout-sessions"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                >
                  View all
                  <ArrowRight aria-hidden="true" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                Open your complete workout history
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead className="text-right">Sets</TableHead>
                <TableHead className="text-right">Reps</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentWorkouts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No completed workouts this week.
                  </TableCell>
                </TableRow>
              ) : (
                recentWorkouts.map((workout) => {
                  return (
                    <TableRow key={workout.workoutSessionId}>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger
                            render={<span className="inline-flex" />}
                          >
                            <Link
                              href={`/workout-sessions/${workout.workoutSessionId}`}
                              className="rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              {formatDashboardDateTime(
                                workout.completedAt,
                                timezone,
                              )}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            Open {workoutLabel(workout)} workout details
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{workoutLabel(workout)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDashboardNumber(
                          workout.completedWorkingSetCount,
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDashboardNumber(workout.totalRepetitions)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatDashboardVolume(workout.volumeLoadKg)}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoreLink
                          href={`/workout-sessions/${workout.workoutSessionId}`}
                          tooltip="View workout details"
                          ariaLabel={`View ${workoutLabel(workout)} workout details`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 md:hidden">
          {recentWorkouts.length === 0 ? (
            <Empty className="min-h-0 flex-none border-0 p-2">
              <EmptyHeader>
                <EmptyTitle>No completed workouts this week</EmptyTitle>
                <EmptyDescription>
                  Your completed sessions will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            recentWorkouts.map((workout, index) => {
              return (
                <div
                  key={workout.workoutSessionId}
                  className="flex flex-col gap-1"
                >
                  {index > 0 ? <Separator /> : null}

                  <div className="flex flex-row justify-between items-center gap-3">
                    <div className="flex min-w-0 flex-col justify-between gap-1">
                      <p className="truncate font-medium">
                        {workoutLabel(workout)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDashboardDateTime(workout.completedAt, timezone)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 justify-self-center text-sm text-muted-foreground">
                      <span>
                        {formatDashboardNumber(
                          workout.completedWorkingSetCount,
                        )}{" "}
                        sets
                      </span>
                      <span>
                        {formatDashboardNumber(workout.totalRepetitions)} reps
                      </span>
                      <span className="text-right text-sm tabular-nums">
                        {formatDashboardVolume(workout.volumeLoadKg)}
                      </span>
                    </div>
                    <MoreLink
                      href={`/workout-sessions/${workout.workoutSessionId}`}
                      tooltip="View workout details"
                      ariaLabel={`View ${workoutLabel(workout)} workout details`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
