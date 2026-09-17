"use client";

import { Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AuthRequiredDialog } from "@/app/(auth)/components/auth-required-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import StyledLink from "@/components/styled-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { adoptTrainingProgramAction } from "../training-program-server-actions";

export function AdoptTrainingProgramControl({
  slug,
  name,
  visibility,
  durationWeeks,
  scheduledWorkoutCount,
}: {
  slug: string;
  name: string;
  visibility: "PRIVATE" | "GLOBAL";
  durationWeeks: number;
  scheduledWorkoutCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showActiveLink, setShowActiveLink] = useState(false);

  function adopt() {
    setFeedback(null);
    startTransition(async () => {
      const result = await adoptTrainingProgramAction(slug);
      if (result.ok) return router.push(`/training-programs/adopted/${result.data.id}`);
      setConfirmOpen(false);
      if (result.status === 401) {
        setAuthOpen(true);
        return;
      }
      if (result.code === "ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL") {
        setFeedback("You already have an active or paused training program.");
        setShowActiveLink(true);
        return;
      }
      if (
        result.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_INTEGRITY_FAILED"
      ) {
        setFeedback("We could not safely adopt this program. Please try again later.");
        return;
      }
      if (
        result.code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE"
      ) {
        setFeedback("A scheduled routine is no longer available. We refreshed the program details.");
        router.refresh();
        return;
      }
      if (
        result.code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT"
      ) {
        setFeedback("This program changed while you were adopting it. We refreshed the latest version.");
        router.refresh();
        return;
      }
      setFeedback(result.message);
    });
  }

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

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Adopt ${name}?`}
        description={
          <>
            This program runs for {durationWeeks} {durationWeeks === 1 ? "week" : "weeks"} and contains {scheduledWorkoutCount} scheduled workouts. {visibility === "GLOBAL" ? "KinetiQ will add a fully editable copy to My Programs and copy its routines into My Routines." : "This will start your existing personal program without creating another copy."} You can have only one active or paused program at a time.
          </>
        }
        cancelLabel="Not now"
        confirmLabel="Adopt program"
        confirmPendingLabel="Adopting…"
        confirmPending={isPending}
        confirmVariant="default"
        onConfirm={adopt}
      />

      <AuthRequiredDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
