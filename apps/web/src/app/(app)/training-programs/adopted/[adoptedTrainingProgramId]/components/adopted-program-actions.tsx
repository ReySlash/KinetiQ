"use client";

import { CirclePlay, Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import StyledLink from "@/components/styled-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";
import { getMobileProgramAction } from "./adopted-program-action-priority";
import {
  updateAdoptedProgramAction,
  type AdoptedProgramCommand as Command,
} from "../../../training-program-server-actions";

function mutationMessage(code: string | null, message: string) {
  if (code === "ADOPTED_TRAINING_PROGRAM_SOURCE_INTEGRITY_FAILED") {
    return "We could not safely start this workout. Please try again later.";
  }

  if (code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT") {
    return "This program changed in another request. We refreshed it with the latest progress.";
  }

  if (code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE") {
    return "This routine is no longer available. The schedule has been refreshed.";
  }

  return message;
}

export function AdoptedProgramActions({
  program,
}: {
  program: AdoptedTrainingProgram;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [skipOpen, setSkipOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const nextOccurrence = program.nextPendingOccurrence;
  const activeSessionId = program.occurrences.find(
    (occurrence) => occurrence.activeSessionId,
  )?.activeSessionId;
  const mobileAction = getMobileProgramAction(program);

  function run(command: Command) {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateAdoptedProgramAction(program.id, command);
      if (!result.ok) {
        setFeedback(mutationMessage(result.code, result.message));
        if (
          result.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE" ||
          result.code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT"
        ) router.refresh();
        return;
      }
      setFeedback(null);
      if (command.type === "start" && "workoutSessionId" in result.data) {
        router.push(`/workout-sessions/${result.data.workoutSessionId}`);
        return;
      }
      router.refresh();
    });
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
          disabled={isPending}
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
        disabled={isPending}
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
              disabled={isPending}
              onClick={() => run({ type: "start", occurrenceId: nextOccurrence.id })}
            >
              <Play data-icon="inline-start" />
              Start workout
            </Button>
          ) : null}
          {program.actions.canResume ? (
            <Button
              size="lg"
              disabled={isPending}
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
                disabled={isPending}
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

      <ConfirmationDialog
        open={skipOpen}
        onOpenChange={setSkipOpen}
        title="Skip this workout?"
        description={
          nextOccurrence
            ? `Week ${nextOccurrence.weekNumber}, day ${nextOccurrence.dayNumber} will count as skipped. This cannot be undone.`
            : "This workout will count as skipped."
        }
        cancelLabel="Keep workout"
        confirmLabel="Skip workout"
        confirmVariant="outline"
        confirmDisabled={isPending || !nextOccurrence}
        onConfirm={() => {
          if (!nextOccurrence) return;
          setSkipOpen(false);
          run({ type: "skip", occurrenceId: nextOccurrence.id });
        }}
      />

      <ConfirmationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this program?"
        description="Your completed workout history stays available, but this program cannot be resumed."
        cancelLabel="Keep program"
        confirmLabel="Cancel program"
        confirmDisabled={isPending}
        onConfirm={() => {
          setCancelOpen(false);
          run({ type: "cancel" });
        }}
      />
    </div>
  );
}
