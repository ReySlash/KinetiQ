import { CalendarRange } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutSessionProvenance } from "@/types/workout-session-types";

export function getProgramReturnHref(provenance: WorkoutSessionProvenance) {
  if (
    provenance.sourceKind !== "PROGRAM_WORKOUT" ||
    !provenance.adoptedTrainingProgramId
  ) {
    return null;
  }
  return `/training-programs/adopted/${provenance.adoptedTrainingProgramId}`;
}

export function WorkoutProgramLink({ provenance, className }: { provenance: WorkoutSessionProvenance; className?: string }) {
  const href = getProgramReturnHref(provenance);
  if (!href) return null;
  return (
    <Link href={href} className={className ?? "text-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"}>
      {provenance.programNameSnapshot ?? "Program"} · Week {provenance.programWeekNumber ?? "—"}, Day {provenance.programDayNumber ?? "—"}
    </Link>
  );
}

export function WorkoutProgramContextCard({ provenance }: { provenance: WorkoutSessionProvenance }) {
  if (!getProgramReturnHref(provenance)) return null;
  return (
    <Card className="gap-1 py-2">
      <CardContent className="flex flex-col items-center gap-1 p-1 text-center">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarRange aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Program workout</p>
          <WorkoutProgramLink provenance={provenance} className="block truncate font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" />
          {provenance.programRoutineNameSnapshot ? <p className="truncate text-sm text-muted-foreground">{provenance.programRoutineNameSnapshot}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
