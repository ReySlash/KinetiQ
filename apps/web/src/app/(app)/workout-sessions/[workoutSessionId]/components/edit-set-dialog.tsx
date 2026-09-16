"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RecordWorkoutSetInput } from "@/types/workout-session-types";

type EditSetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repetitions: number;
  load: string;
  isSubmitting?: boolean;
  onConfirm: (input: Partial<RecordWorkoutSetInput>) => void | Promise<void>;
};

export function EditSetDialog({
  open,
  onOpenChange,
  repetitions: initialRepetitions,
  load: initialLoad,
  isSubmitting = false,
  onConfirm,
}: EditSetDialogProps) {
  const [repetitions, setRepetitions] = useState(String(initialRepetitions));
  const [load, setLoad] = useState(initialLoad);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!repetitions.trim()) {
      setValidationError("Repetitions are required.");
      return;
    }
    if (!load.trim()) {
      setValidationError("Load is required.");
      return;
    }

    setValidationError(null);
    onOpenChange(false);
    await onConfirm({
      repetitions: Number(repetitions),
      load: load.trim(),
      loadUnit: "KG",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit set</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {validationError ? (
            <p role="alert" className="text-sm text-destructive">
              {validationError}
            </p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="edit-workout-repetitions">Repetitions</Label>
            <Input
              id="edit-workout-repetitions"
              inputMode="numeric"
              value={repetitions}
              onChange={(event) => setRepetitions(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-workout-load">Load (kg)</Label>
            <Input
              id="edit-workout-load"
              inputMode="decimal"
              value={load}
              onChange={(event) => setLoad(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter className="flex-row justify-center">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving set…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
