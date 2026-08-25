"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listExercises } from "@/lib/routines-api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function WorkoutExercisePicker({ onAddExercise, isAdding = false }: { onAddExercise: (exerciseId: string) => void | Promise<void>; isAdding?: boolean }) {
  const [open, setOpen] = useState(false);
  const exercises = useQuery({ queryKey: ["workout-exercise-picker"], queryFn: () => listExercises() });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" className="w-full" />}>
        <span aria-hidden="true">+</span> Add exercise
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>Choose an exercise to add to this workout.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1 overflow-auto">
          {exercises.isLoading && <p className="text-sm text-muted-foreground">Loading exercises…</p>}
          {exercises.isError && <p role="alert" className="text-sm text-destructive">Unable to load exercises.</p>}
          {exercises.data?.map((exercise) => (
            <Button key={exercise.id} type="button" variant="ghost" className="w-full justify-start" disabled={isAdding} onClick={() => { void (async () => { await onAddExercise(exercise.id); setOpen(false); })(); }}>
              {exercise.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
