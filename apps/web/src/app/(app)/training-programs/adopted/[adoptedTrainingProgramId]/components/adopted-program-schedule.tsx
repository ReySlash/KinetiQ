import {
  AlertTriangle,
  CircleCheck,
  CircleDashed,
  CirclePause,
  SkipForward,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { cn } from "@/lib/utils";
import type {
  AdoptedTrainingProgram,
  ProgramWorkoutOccurrence,
} from "@/types/adopted-training-program-types";

function statusDetails(status: ProgramWorkoutOccurrence["status"]) {
  if (status === "COMPLETED")
    return {
      label: "Completed",
      icon: CircleCheck,
      variant: "secondary" as const,
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    };
  if (status === "SKIPPED")
    return {
      label: "Skipped",
      icon: SkipForward,
      variant: "outline" as const,
      className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    };
  if (status === "IN_PROGRESS")
    return {
      label: "In progress",
      icon: CirclePause,
      variant: "default" as const,
      className: "",
    };
  return {
    label: "Pending",
    icon: CircleDashed,
    variant: "outline" as const,
    className: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  };
}

function OccurrenceStatus({
  occurrence,
}: {
  occurrence: ProgramWorkoutOccurrence;
}) {
  const details = statusDetails(occurrence.status);
  const Icon = details.icon;
  return (
    <Badge
      variant={details.variant}
      className={`h-6 min-w-24 justify-center px-2.5 ${details.className}`}
    >
      <Icon data-icon="inline-start" />
      {details.label}
    </Badge>
  );
}

function groupedOccurrences(occurrences: ProgramWorkoutOccurrence[]) {
  const weeks = new Map<number, ProgramWorkoutOccurrence[]>();
  for (const occurrence of occurrences) {
    weeks.set(occurrence.weekNumber, [
      ...(weeks.get(occurrence.weekNumber) ?? []),
      occurrence,
    ]);
  }
  return Array.from(weeks.entries());
}

export function AdoptedProgramSchedule({
  program,
}: {
  program: AdoptedTrainingProgram;
}) {
  const hasUnavailableRoutine = program.occurrences.some(
    (occurrence) =>
      !occurrence.sourceRoutineAvailable && occurrence.status === "PENDING",
  );
  const orderedOccurrences = [...program.occurrences].sort(
    (left, right) =>
      left.weekNumber - right.weekNumber || left.dayNumber - right.dayNumber,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout schedule</CardTitle>
        <CardDescription>
          Follow the copied schedule in order. Template changes will not rewrite
          this plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {hasUnavailableRoutine ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>A scheduled routine is unavailable</AlertTitle>
            <AlertDescription>
              Its name and place in the program are preserved, but it cannot be
              started. You can skip it to continue.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Routine</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderedOccurrences.map((occurrence) => {
                const isNext =
                  occurrence.id === program.nextPendingOccurrence?.id;
                return (
                  <TableRow
                    key={occurrence.id}
                    className={cn(isNext && "bg-primary/5")}
                  >
                    <TableCell>{occurrence.weekNumber}</TableCell>
                    <TableCell>{occurrence.dayNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {occurrence.routineNameSnapshot}
                        </span>
                        {isNext ? <Badge variant="outline">Next</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-64 text-muted-foreground">
                      {occurrence.programSlotNotesSnapshot ?? "—"}
                    </TableCell>
                    <TableCell>
                      <OccurrenceStatus occurrence={occurrence} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4 md:hidden">
          {groupedOccurrences(orderedOccurrences).map(
            ([weekNumber, occurrences]) => (
              <section
                key={weekNumber}
                className="flex flex-col gap-2"
                aria-labelledby={`week-${weekNumber}`}
              >
                <h3 id={`week-${weekNumber}`} className="text-sm font-semibold">
                  Week {weekNumber}
                </h3>
                {occurrences.map((occurrence) => {
                  const isNext =
                    occurrence.id === program.nextPendingOccurrence?.id;
                  return (
                    <article
                      key={occurrence.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border border-border/70 p-3",
                        isNext && "border-primary/60 bg-primary/5",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Day {occurrence.dayNumber}
                          </p>
                          <p className="truncate font-medium">
                            {occurrence.routineNameSnapshot}
                          </p>
                        </div>
                        <OccurrenceStatus occurrence={occurrence} />
                      </div>
                      {occurrence.programSlotNotesSnapshot ? (
                        <p className="text-sm text-muted-foreground">
                          {occurrence.programSlotNotesSnapshot}
                        </p>
                      ) : null}
                      {isNext ? (
                        <Badge variant="outline">Next workout</Badge>
                      ) : null}
                    </article>
                  );
                })}
              </section>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
