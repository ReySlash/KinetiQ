"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ActiveWorkout } from "./active-workout";
import { CancelWorkoutDialog } from "./cancel-workout-dialog";
import { FinishWorkoutDialog } from "./finish-workout-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cancelWorkout,
  completeWorkout,
  deleteWorkoutSet,
  recordWorkoutSet,
  updateWorkoutSet,
} from "@/lib/workout-sessions-api";
import type { WorkoutSession } from "@/types/workout-session-types";
import {
  getProgramReturnHref,
  WorkoutProgramContextCard,
} from "../../components/workout-program-context";

export function ActiveWorkoutController({
  session,
}: {
  session: WorkoutSession;
}) {
  const router = useRouter();
  const setOperationInFlight = useRef(false);
  const lifecycleInFlight = useRef(false);
  const [setPending, setSetPending] = useState(false);
  const [setError, setSetError] = useState<string | null>(null);
  const [lifecyclePending, setLifecyclePending] = useState<
    "complete" | "cancel" | null
  >(null);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const programReturnHref = getProgramReturnHref(session.provenance);

  async function runSetMutation(operation: () => Promise<unknown>) {
    if (setOperationInFlight.current || lifecycleInFlight.current) return;
    setOperationInFlight.current = true;
    setSetPending(true);
    setSetError(null);
    try {
      await operation();
      router.refresh();
    } catch (error) {
      setSetError(
        error instanceof Error ? error.message : "Workout set update failed.",
      );
    } finally {
      setOperationInFlight.current = false;
      setSetPending(false);
    }
  }

  async function finishAndNavigate(command: "complete" | "cancel") {
    if (lifecycleInFlight.current || setOperationInFlight.current) return;
    lifecycleInFlight.current = true;
    setLifecyclePending(command);
    setLifecycleError(null);
    try {
      if (command === "complete") await completeWorkout(session.id);
      else await cancelWorkout(session.id);
      if (programReturnHref) router.push(programReturnHref);
      else router.refresh();
    } catch (error) {
      setLifecycleError(
        error instanceof Error ? error.message : "Workout update failed.",
      );
    } finally {
      lifecycleInFlight.current = false;
      setLifecyclePending(null);
    }
  }

  return (
    <div className="mx-auto grid gap-1 md:gap-3 p-1">
      <WorkoutProgramContextCard provenance={session.provenance} />
      <ActiveWorkout
        session={session}
        isSubmitting={setPending}
        error={setError}
        onRecordSet={async (performanceId, input) => {
          await runSetMutation(() =>
            recordWorkoutSet(session.id, performanceId, input),
          );
        }}
        onDeleteSet={async (setId) => {
          const performance = session.performances.find((item) =>
            item.completedSets.some(
              (completedSet) => completedSet.id === setId,
            ),
          );
          if (!performance) return;
          await runSetMutation(() =>
            deleteWorkoutSet(session.id, performance.id, setId),
          );
        }}
        onUpdateSet={async (setId, input) => {
          const performance = session.performances.find((item) =>
            item.completedSets.some(
              (completedSet) => completedSet.id === setId,
            ),
          );
          if (!performance) return;
          await runSetMutation(() =>
            updateWorkoutSet(session.id, performance.id, setId, input),
          );
        }}
      />
      {lifecycleError ? (
        <Alert variant="destructive">
          <AlertTitle>Workout update failed</AlertTitle>
          <AlertDescription>{lifecycleError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-row justify-center gap-2 px-3 md:justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                onClick={() => setCancelOpen(true)}
                disabled={Boolean(lifecyclePending) || setPending}
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
                disabled={Boolean(lifecyclePending) || setPending}
              />
            }
          >
            {lifecyclePending === "complete" ? "Finishing…" : "Finish workout"}
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
