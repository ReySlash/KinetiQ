"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ActiveWorkout } from "./active-workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  addWorkoutExercise,
  cancelWorkout,
  completeWorkout,
  deleteWorkoutSet,
  recordWorkoutSet,
  removeWorkoutExercise,
  updateWorkoutSet,
} from "@/lib/workout-sessions-api";
import type {
  RecordWorkoutSetInput,
  WorkoutSession,
} from "@/types/workout-session-types";
import { WorkoutExercisePicker } from "./workout-exercise-picker";
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
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      performanceId,
      input,
    }: {
      performanceId: string;
      input: RecordWorkoutSetInput;
    }) => recordWorkoutSet(session.id, performanceId, input),
  });
  const finishMutation = useMutation({
    mutationFn: () => completeWorkout(session.id),
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelWorkout(session.id),
  });
  const deleteMutation = useMutation({
    mutationFn: ({
      performanceId,
      setId,
    }: {
      performanceId: string;
      setId: string;
    }) => deleteWorkoutSet(session.id, performanceId, setId),
  });
  const updateMutation = useMutation({
    mutationFn: ({
      performanceId,
      setId,
      input,
    }: {
      performanceId: string;
      setId: string;
      input: Parameters<typeof updateWorkoutSet>[3];
    }) => updateWorkoutSet(session.id, performanceId, setId, input),
  });
  const addExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) =>
      addWorkoutExercise(session.id, { exerciseId }),
  });
  const removeExerciseMutation = useMutation({
    mutationFn: (exercisePerformanceId: string) =>
      removeWorkoutExercise(session.id, { exercisePerformanceId }),
  });
  const programReturnHref = getProgramReturnHref(session.provenance);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
    router.refresh();
  }

  async function finishAndNavigate(command: "complete" | "cancel") {
    if (command === "complete") await finishMutation.mutateAsync();
    else await cancelMutation.mutateAsync();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] }),
      queryClient.invalidateQueries({
        queryKey: ["adopted-training-programs"],
      }),
    ]);
    if (programReturnHref) router.push(programReturnHref);
    else router.refresh();
  }

  return (
    <div className="mx-auto grid gap-3 p-1 md:p-2">
      <WorkoutProgramContextCard provenance={session.provenance} />
      <ActiveWorkout
        session={session}
        isSubmitting={
          mutation.isPending ||
          deleteMutation.isPending ||
          updateMutation.isPending ||
          removeExerciseMutation.isPending
        }
        error={
          mutation.error?.message ??
          deleteMutation.error?.message ??
          updateMutation.error?.message ??
          removeExerciseMutation.error?.message
        }
        onRecordSet={async (performanceId, input) => {
          await mutation.mutateAsync({ performanceId, input });
          await refresh();
        }}
        onDeleteSet={async (setId) => {
          const performance = session.performances.find((item) =>
            item.completedSets.some(
              (completedSet) => completedSet.id === setId,
            ),
          );
          if (!performance) return;
          await deleteMutation.mutateAsync({
            performanceId: performance.id,
            setId,
          });
          await refresh();
        }}
        onUpdateSet={async (setId, input) => {
          const performance = session.performances.find((item) =>
            item.completedSets.some(
              (completedSet) => completedSet.id === setId,
            ),
          );
          if (!performance) return;
          await updateMutation.mutateAsync({
            performanceId: performance.id,
            setId,
            input,
          });
          await refresh();
        }}
        onRemoveExercise={async (performanceId) => {
          await removeExerciseMutation.mutateAsync(performanceId);
          await refresh();
        }}
      />
      <WorkoutExercisePicker
        isAdding={addExerciseMutation.isPending}
        onAddExercise={async (exerciseId) => {
          await addExerciseMutation.mutateAsync(exerciseId);
          await refresh();
        }}
      />
      {finishMutation.isError || cancelMutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Workout update failed</AlertTitle>
          <AlertDescription>
            {finishMutation.error?.message ?? cancelMutation.error?.message}
          </AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() =>
              void finishAndNavigate("cancel").catch(() => undefined)
            }
            disabled={finishMutation.isPending || cancelMutation.isPending}
          >
            Cancel workout
          </Button>
          <Button
            onClick={() =>
              void finishAndNavigate("complete").catch(() => undefined)
            }
            disabled={finishMutation.isPending || cancelMutation.isPending}
          >
            {finishMutation.isPending ? "Finishing…" : "Finish workout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
