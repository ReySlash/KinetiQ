"use client";

import { useMutation } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { startProgramWorkout } from "@/lib/adopted-training-programs-api";
import { ApiError } from "@/lib/api/error";

function startErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "We could not start this workout. Check your connection and try again.";
}

export function DashboardStartWorkoutButton({
  adoptedTrainingProgramId,
  occurrenceId,
}: {
  adoptedTrainingProgramId: string;
  occurrenceId: string;
}) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: () =>
      startProgramWorkout(adoptedTrainingProgramId, occurrenceId, {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    onSuccess: (result) => {
      router.push(`/workout-sessions/${result.workoutSessionId}`);
    },
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              <Play data-icon="inline-start" />
              {mutation.isPending ? "Starting..." : "Start workout"}
            </Button>
          }
        />
        <TooltipContent>
          Start the next workout in your active program
        </TooltipContent>
      </Tooltip>
      {mutation.isError ? (
        <p
          role="alert"
          className="col-span-2 text-xs text-destructive md:basis-full md:text-right"
        >
          {startErrorMessage(mutation.error)}
        </p>
      ) : null}
    </>
  );
}
