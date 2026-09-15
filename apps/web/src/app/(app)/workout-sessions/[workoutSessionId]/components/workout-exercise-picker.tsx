"use client";

import { useEffect, useState } from "react";
import { listExercises } from "@/lib/routines-api";
import type { ExerciseOption } from "@/types/routine-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function WorkoutExercisePicker({ onAddExercise, isAdding = false }: { onAddExercise: (exerciseId: string) => void | Promise<void>; isAdding?: boolean }) {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void listExercises("", { signal: controller.signal })
      .then(setExercises)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load exercises.");
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
      <DialogTrigger render={<Button type="button" variant="outline" className="w-full" />}>
        <span aria-hidden="true">+</span> Add exercise
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>Choose an exercise to add to this workout.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1 overflow-auto">
          {isLoading && <p className="text-sm text-muted-foreground">Loading exercises…</p>}
          {error && <div className="flex items-center justify-between gap-2"><p role="alert" className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={retry}>Retry</Button></div>}
          {exercises.map((exercise) => (
            <Button key={exercise.id} type="button" variant="ghost" className="w-full justify-start" disabled={isAdding} onClick={() => { void (async () => { await onAddExercise(exercise.id); setOpen(false); })(); }}>
              {exercise.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
