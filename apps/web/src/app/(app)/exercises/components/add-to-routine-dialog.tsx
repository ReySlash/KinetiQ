"use client";

import { Plus, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { listRoutines } from "@/lib/routines-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StyledLink from "@/components/styled-link";
import { RoutineChoice } from "./routine-choice";
import type { RoutineListItem } from "@/types/routine-types";

type AddToRoutineDialogProps = {
  exerciseSlug: string;
  exerciseName: string;
  triggerSize?: "sm" | "default" | "lg";
};

export function AddToRoutineDialog({
  exerciseSlug,
  exerciseName,
  triggerSize = "lg",
}: AddToRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void listRoutines("", "updatedAt:desc", "my", {
      signal: controller.signal,
    })
      .then(setRoutines)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load routines.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [open, retryKey]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setIsLoading(true);
      setError(null);
    }
  }

  function retry() {
    setIsLoading(true);
    setError(null);
    setRetryKey((value) => value + 1);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <DialogTrigger
          render={
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size={triggerSize}
                  className="h-10 cursor-pointer border-primary/50! bg-primary/5 text-primary hover:border-primary! hover:bg-primary! hover:text-black!"
                />
              }
            />
          }
        >
          <Plus data-icon="inline-start" />
          Add to routine
        </DialogTrigger>
        <TooltipContent>Add this exercise to a routine</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add {exerciseName} to a routine</DialogTitle>
          <DialogDescription>
            Choose a routine to open in the builder. The exercise will be staged
            there until you complete its prescription.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading routines…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <p role="alert" className="text-center text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={retry}>Retry</Button>
            </div>
          ) : routines.length ? (
            routines.map((routine) => (
              <RoutineChoice
                key={routine.slug}
                routine={routine}
                exerciseSlug={exerciseSlug}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              You do not have any routines yet.
            </p>
          )}
        </div>

        <DialogFooter>
          <StyledLink
            href={`/routines/new?exerciseSlug=${encodeURIComponent(exerciseSlug)}`}
            variant="outline"
          >
            <Plus />
            Create new routine
          </StyledLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
