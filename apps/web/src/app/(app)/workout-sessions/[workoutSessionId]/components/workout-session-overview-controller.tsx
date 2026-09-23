"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cancelWorkout, completeWorkout } from "@/lib/workout-sessions-api";
import type { WorkoutSession } from "@/types/workout-session-types";
import { CancelWorkoutDialog } from "./cancel-workout-dialog";
import { FinishWorkoutDialog } from "./finish-workout-dialog";
import { WorkoutSessionOverview } from "./workout-session-overview";
import { getProgramReturnHref } from "../../components/workout-program-context";

export function WorkoutSessionOverviewController({
  session,
}: {
  session: WorkoutSession;
}) {
  const router = useRouter();
  const lifecycleInFlight = useRef(false);
  const [pending, setPending] = useState<"complete" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const programReturnHref = getProgramReturnHref(session.provenance);

  async function finishAndNavigate(command: "complete" | "cancel") {
    if (lifecycleInFlight.current) return;
    lifecycleInFlight.current = true;
    setPending(command);
    setError(null);
    try {
      if (command === "complete") await completeWorkout(session.id);
      else await cancelWorkout(session.id);
      if (programReturnHref) router.push(programReturnHref);
      else router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Workout update failed.",
      );
    } finally {
      lifecycleInFlight.current = false;
      setPending(null);
    }
  }

  return (
    <div className="mx-auto grid gap-1 px-1">
      <WorkoutSessionOverview session={session} />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Workout update failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex justify-center gap-2 px-1 md:justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                onClick={() => setCancelOpen(true)}
                disabled={pending !== null}
              />
            }
          >
            Cancel workout
          </TooltipTrigger>
          <TooltipContent>Cancel workout</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => setFinishOpen(true)}
                disabled={pending !== null}
              />
            }
          >
            {pending === "complete" ? "Finishing…" : "Finish workout"}
          </TooltipTrigger>
          <TooltipContent>Finish workout</TooltipContent>
        </Tooltip>
      </div>
      <CancelWorkoutDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => finishAndNavigate("cancel")}
      />
      <FinishWorkoutDialog
        open={finishOpen}
        onOpenChange={setFinishOpen}
        onConfirm={() => finishAndNavigate("complete")}
      />
    </div>
  );
}
