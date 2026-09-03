"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthRequiredDialog } from "@/components/auth-required-dialog";
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
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { adoptTrainingProgram } from "@/lib/adopted-training-programs-api";
import { ApiError } from "@/lib/api/error";

export function AdoptTrainingProgramControl({
  slug,
  name,
  durationWeeks,
  scheduledWorkoutCount,
}: {
  slug: string;
  name: string;
  durationWeeks: number;
  scheduledWorkoutCount: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showActiveLink, setShowActiveLink] = useState(false);

  const mutation = useMutation({
    mutationFn: () => adoptTrainingProgram(slug),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["adopted-training-programs"] });
      router.push(`/training-programs/adopted/${result.id}`);
    },
    onError: (error) => {
      setConfirmOpen(false);
      if (error instanceof ApiError && error.status === 401) {
        setAuthOpen(true);
        return;
      }
      if (
        error instanceof ApiError &&
        error.code === "ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL"
      ) {
        setFeedback("You already have an active or paused training program.");
        setShowActiveLink(true);
        return;
      }
      if (
        error instanceof ApiError &&
        error.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_INTEGRITY_FAILED"
      ) {
        setFeedback("We could not safely adopt this program. Please try again later.");
        return;
      }
      if (
        error instanceof ApiError &&
        error.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE"
      ) {
        setFeedback("A scheduled routine is no longer available. We refreshed the program details.");
        router.refresh();
        return;
      }
      if (
        error instanceof ApiError &&
        error.code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT"
      ) {
        setFeedback("This program changed while you were adopting it. We refreshed the latest version.");
        router.refresh();
        return;
      }
      setFeedback(error instanceof Error ? error.message : "We could not adopt this program. Please try again.");
    },
  });

  if (scheduledWorkoutCount === 0) {
    return (
      <div className="flex flex-col gap-2">
        <Button size="lg" disabled>
          <Dumbbell data-icon="inline-start" />
          Adopt program
        </Button>
        <p className="text-sm text-muted-foreground">
          This program needs at least one scheduled workout before it can be adopted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={() => setConfirmOpen(true)}>
        <Dumbbell data-icon="inline-start" />
        Adopt program
      </Button>

      {feedback ? (
        <Alert variant="destructive">
          <AlertTitle>Could not adopt program</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{feedback}</span>
            {showActiveLink ? (
              <StyledLink href="/training-programs/active" variant="outline" size="sm">
                View active program
              </StyledLink>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia><Dumbbell /></AlertDialogMedia>
            <AlertDialogTitle>Adopt {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This program runs for {durationWeeks} {durationWeeks === 1 ? "week" : "weeks"} and contains {scheduledWorkoutCount} scheduled workouts. KinetiQ creates an independent snapshot, so later template changes will not alter your plan. You can have only one active or paused program at a time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Adopting…" : "Adopt program"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthRequiredDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
