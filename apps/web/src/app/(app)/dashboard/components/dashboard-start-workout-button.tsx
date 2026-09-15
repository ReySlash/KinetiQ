"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateAdoptedProgramAction } from "../../training-programs/training-program-server-actions";

export function DashboardStartWorkoutButton({
  adoptedTrainingProgramId,
  occurrenceId,
}: {
  adoptedTrainingProgramId: string;
  occurrenceId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startWorkout() {
    setError(null);
    startTransition(async () => {
      const result = await updateAdoptedProgramAction(adoptedTrainingProgramId, {
        type: "start",
        occurrenceId,
      });
      if (result.ok && "workoutSessionId" in result.data) {
        router.push(`/workout-sessions/${result.data.workoutSessionId}`);
        return;
      }
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button disabled={isPending} onClick={startWorkout}>
              <Play data-icon="inline-start" />
              {isPending ? "Starting..." : "Start workout"}
            </Button>
          }
        />
        <TooltipContent>
          Start the next workout in your active program
        </TooltipContent>
      </Tooltip>
      {error ? (
        <p
          role="alert"
          className="col-span-2 text-xs text-destructive md:basis-full md:text-right"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
