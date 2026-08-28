"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, LoaderCircle } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import type { RoutineListItem } from "@/types/routine-types";

type AddToRoutineDialogProps = {
  exerciseSlug: string;
  exerciseName: string;
  triggerSize?: "sm" | "default" | "lg";
};

export function AddToRoutineDialog({
  exerciseSlug,
  exerciseName,
}: AddToRoutineDialogProps) {
  const routines = useQuery({
    queryKey: ["routines", "picker"],
    queryFn: () => listRoutines(),
    enabled: false,
  });

  function handleOpenChange(open: boolean) {
    if (open) {
      void routines.refetch();
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <Tooltip>
        <DialogTrigger
          render={
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 cursor-pointer !border-primary/50 bg-primary/5 text-primary hover:!border-primary hover:!bg-primary hover:!text-black"
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
          {routines.isFetching ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading routines…
            </div>
          ) : routines.isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {routines.error.message}
            </p>
          ) : routines.data?.length ? (
            routines.data.map((routine) => (
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
          <Button
            nativeButton={false}
            variant="outline"
            render={
              <Link
                href={`/routines/new?exerciseSlug=${encodeURIComponent(exerciseSlug)}`}
              />
            }
          >
            <Plus />
            Create new routine
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoutineChoice({
  routine,
  exerciseSlug,
}: {
  routine: RoutineListItem;
  exerciseSlug: string;
}) {
  return (
    <Card className="transition-colors hover:border-primary/50">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{routine.name}</p>
          <p className="text-xs text-muted-foreground">
            {routine.exerciseCount}{" "}
            {routine.exerciseCount === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <Button
          nativeButton={false}
          size="sm"
          render={
            <Link
              href={`/routines/${routine.slug}/edit?exerciseSlug=${encodeURIComponent(exerciseSlug)}`}
            />
          }
        >
          Open builder
        </Button>
      </CardContent>
    </Card>
  );
}
