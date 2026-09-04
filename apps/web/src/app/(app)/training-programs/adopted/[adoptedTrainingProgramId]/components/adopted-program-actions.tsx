"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CirclePlay, Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import StyledLink from "@/components/styled-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  cancelAdoptedTrainingProgram,
  pauseAdoptedTrainingProgram,
  resumeAdoptedTrainingProgram,
  skipProgramWorkout,
  startProgramWorkout,
} from "@/lib/adopted-training-programs-api";
import { ApiError } from "@/lib/api/error";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";
import { getMobileProgramAction } from "./adopted-program-action-priority";

type Command =
  | { type: "pause" }
  | { type: "resume" }
  | { type: "cancel" }
  | { type: "start"; occurrenceId: string }
  | { type: "skip"; occurrenceId: string };

function mutationMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "We could not update this program. Check your connection and try again.";
  }

  if (error.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_INTEGRITY_FAILED") {
    return "We could not safely start this workout. Please try again later.";
  }

  if (error.code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT") {
    return "This program changed in another request. We refreshed it with the latest progress.";
  }

  if (error.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE") {
    return "This routine is no longer available. The schedule has been refreshed.";
  }

  return error.message;
}

export function AdoptedProgramActions({
  program,
}: {
  program: AdoptedTrainingProgram;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [skipOpen, setSkipOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const nextOccurrence = program.nextPendingOccurrence;
  const activeSessionId = program.occurrences.find(
    (occurrence) => occurrence.activeSessionId,
  )?.activeSessionId;
  const mobileAction = getMobileProgramAction(program);

  const mutation = useMutation({
    mutationFn: async (command: Command) => {
      if (command.type === "pause") {
        return pauseAdoptedTrainingProgram(program.id);
      }
      if (command.type === "resume") {
        return resumeAdoptedTrainingProgram(program.id);
      }
      if (command.type === "cancel") {
        return cancelAdoptedTrainingProgram(program.id);
      }
      if (command.type === "skip") {
        return skipProgramWorkout(program.id, command.occurrenceId);
      }
      return startProgramWorkout(program.id, command.occurrenceId, {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    },
    onSuccess: async (result, command) => {
      setFeedback(null);
      await queryClient.invalidateQueries({ queryKey: ["adopted-training-programs"] });
      if (command.type === "start" && "workoutSessionId" in result) {
        router.push(`/workout-sessions/${result.workoutSessionId}`);
        return;
      }
      router.refresh();
    },
    onError: (error) => {
      setFeedback(mutationMessage(error));
      if (
        error instanceof ApiError &&
        (error.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE" ||
          error.code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT")
      ) {
        router.refresh();
      }
    },
  });

  function run(command: Command) {
    setFeedback(null);
    mutation.mutate(command);
  }

  function primaryButton(
    action: NonNullable<typeof mobileAction>,
    fullWidth = false,
  ) {
    const actionClassName = fullWidth ? "w-full" : "w-auto";
    if (action.kind === "continue") {
      return (
        <StyledLink
          href={`/workout-sessions/${action.workoutSessionId}`}
          size="lg"
          className={actionClassName}
        >
          <CirclePlay data-icon="inline-start" />
          Continue workout
        </StyledLink>
      );
    }
    if (action.kind === "resume") {
      return (
        <Button
          size="lg"
          className={actionClassName}
          disabled={mutation.isPending}
          onClick={() => run({ type: "resume" })}
        >
          <RotateCcw data-icon="inline-start" />
          Resume program
        </Button>
      );
    }
    return (
      <Button
        size="lg"
        className={actionClassName}
        disabled={mutation.isPending}
        onClick={() => run({ type: "start", occurrenceId: action.occurrenceId })}
      >
        <Play data-icon="inline-start" />
        Start workout
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {feedback ? (
        <Alert variant="destructive">
          <AlertTitle>Program update failed</AlertTitle>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end">
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {activeSessionId ? (
            <StyledLink href={`/workout-sessions/${activeSessionId}`} size="lg">
              <CirclePlay data-icon="inline-start" />
              Continue workout
            </StyledLink>
          ) : null}
          {program.actions.canStartNext && nextOccurrence ? (
            <Button
              size="lg"
              disabled={mutation.isPending}
              onClick={() => run({ type: "start", occurrenceId: nextOccurrence.id })}
            >
              <Play data-icon="inline-start" />
              Start workout
            </Button>
          ) : null}
          {program.actions.canResume ? (
            <Button
              size="lg"
              disabled={mutation.isPending}
              onClick={() => run({ type: "resume" })}
            >
              <RotateCcw data-icon="inline-start" />
              Resume program
            </Button>
          ) : null}
        </div>

        {program.actions.canSkipNext ||
        program.actions.canPause ||
        program.actions.canCancel ? (
          <div
            role="group"
            aria-label="Mobile program controls"
            className="flex flex-wrap items-center gap-2"
          >
            {program.actions.canSkipNext && nextOccurrence ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSkipOpen(true)}
              >
                <SkipForward data-icon="inline-start" />
                Skip workout
              </Button>
            ) : null}
            {program.actions.canPause ? (
              <Button
                variant="outline"
                size="lg"
                disabled={mutation.isPending}
                onClick={() => run({ type: "pause" })}
              >
                <Pause data-icon="inline-start" />
                Pause program
              </Button>
            ) : null}
            {program.actions.canCancel ? (
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setCancelOpen(true)}
              >
                <X data-icon="inline-start" />
                Cancel program
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {mobileAction ? (
        <div className="fixed inset-x-2 bottom-14 flex justify-center md:hidden">
          {primaryButton(mobileAction)}
        </div>
      ) : null}

      <AlertDialog open={skipOpen} onOpenChange={setSkipOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              {nextOccurrence
                ? `Week ${nextOccurrence.weekNumber}, day ${nextOccurrence.dayNumber} will count as skipped. This cannot be undone.`
                : "This workout will count as skipped."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep workout</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              disabled={mutation.isPending || !nextOccurrence}
              onClick={() => {
                if (!nextOccurrence) return;
                setSkipOpen(false);
                run({ type: "skip", occurrenceId: nextOccurrence.id });
              }}
            >
              Skip workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this program?</AlertDialogTitle>
            <AlertDialogDescription>
              Your completed workout history stays available, but this program cannot be resumed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep program</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() => {
                setCancelOpen(false);
                run({ type: "cancel" });
              }}
            >
              Cancel program
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
