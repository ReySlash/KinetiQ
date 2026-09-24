"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useRef, useState, startTransition } from "react";
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
  createOptimisticCompletedSet,
  optimisticWorkoutSessionReducer,
  type OptimisticWorkoutSessionAction,
} from "./optimistic-workout-session";
import { getProgramReturnHref } from "../../components/workout-program-context";

export function ActiveWorkoutController({
  session,
  exercisePerformanceId,
}: {
  session: WorkoutSession;
  exercisePerformanceId?: string;
}) {
  const router = useRouter();
  const [optimisticSession, addOptimisticAction] = useOptimistic(
    session,
    optimisticWorkoutSessionReducer,
  );
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

  async function runSetMutation(
    action: OptimisticWorkoutSessionAction,
    operation: () => Promise<unknown>,
  ): Promise<boolean> {
    if (setOperationInFlight.current || lifecycleInFlight.current) return false;
    setOperationInFlight.current = true;
    setSetPending(true);
    setSetError(null);

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        addOptimisticAction(action);
        let succeeded = false;
        try {
          await operation();
          succeeded = true;
          router.refresh();
        } catch (error) {
          setSetError(
            error instanceof Error
              ? error.message
              : "Workout set update failed.",
          );
        } finally {
          setOperationInFlight.current = false;
          setSetPending(false);
          resolve(succeeded);
        }
      });
    });
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
    <div className="mx-auto grid gap-1 md:gap-1 p-1 h-full">
      <ActiveWorkout
        session={optimisticSession}
        exercisePerformanceId={exercisePerformanceId}
        isSubmitting={setPending}
        error={setError}
        onRecordSet={async (performanceId, input) => {
          const performance = optimisticSession.performances.find(
            (item) => item.id === performanceId,
          );
          if (!performance) return;
          return runSetMutation(
            {
              type: "record",
              exercisePerformanceId: performanceId,
              completedSet: createOptimisticCompletedSet(
                performance.completedSets,
                input,
              ),
            },
            () => recordWorkoutSet(session.id, performanceId, input),
          );
        }}
        onDeleteSet={async (setId) => {
          const performance = optimisticSession.performances.find((item) =>
            item.completedSets.some(
              (completedSet) => completedSet.id === setId,
            ),
          );
          if (!performance) return;
          await runSetMutation(
            {
              type: "delete",
              exercisePerformanceId: performance.id,
              completedSetId: setId,
            },
            () => deleteWorkoutSet(session.id, performance.id, setId),
          );
        }}
        onUpdateSet={async (setId, input) => {
          const performance = optimisticSession.performances.find((item) =>
            item.completedSets.some(
              (completedSet) => completedSet.id === setId,
            ),
          );
          if (!performance) return;
          await runSetMutation(
            {
              type: "update",
              exercisePerformanceId: performance.id,
              completedSetId: setId,
              input,
            },
            () => updateWorkoutSet(session.id, performance.id, setId, input),
          );
        }}
        onRequestFinish={
          exercisePerformanceId ? () => setFinishOpen(true) : undefined
        }
      />
      {lifecycleError ? (
        <Alert variant="destructive">
          <AlertTitle>Workout update failed</AlertTitle>
          <AlertDescription>{lifecycleError}</AlertDescription>
        </Alert>
      ) : null}
      {!exercisePerformanceId && (
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
              {lifecyclePending === "complete"
                ? "Finishing…"
                : "Finish workout"}
            </TooltipTrigger>
            <TooltipContent>Finish workout</TooltipContent>
          </Tooltip>
        </div>
      )}
      {!exercisePerformanceId && (
        <CancelWorkoutDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onConfirm={() => finishAndNavigate("cancel")}
        />
      )}
      <FinishWorkoutDialog
        open={finishOpen}
        onOpenChange={setFinishOpen}
        onConfirm={() => finishAndNavigate("complete")}
      />
    </div>
  );
}
