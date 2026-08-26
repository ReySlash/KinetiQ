"use client";

import { useState } from "react";
import { Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { startWorkout } from "@/lib/workout-sessions-api";
import type { RoutineListItem } from "@/types/routine-types";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StartWorkoutDialog({
  routines,
}: {
  routines: RoutineListItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [routineSlug, setRoutineSlug] = useState("freestyle");
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const selectedRoutineName =
    routineSlug === "freestyle"
      ? "Freestyle workout"
      : (routines.find((routine) => routine.slug === routineSlug)?.name ??
        "Select a routine");

  async function handleStart() {
    setIsStarting(true);
    setStartError(null);
    try {
      const response = await startWorkout({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(routineSlug !== "freestyle" ? { routineSlug } : {}),
      });
      setOpen(false);
      router.push(`/workout-sessions/${response.id}`);
    } catch (error) {
      setStartError(
        error instanceof Error ? error.message : "Unable to start the workout.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setStartError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="lg" className="min-w-0 flex-1 md:flex-none md:px-4" />
        }
      >
        <Plus data-icon="inline-start" />
        Start new workout
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a workout</DialogTitle>
          <DialogDescription>
            Choose freestyle training or start from one of your routines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="start-workout-routine">Routine</Label>
          <Select
            value={routineSlug}
            disabled={isStarting}
            onValueChange={(value) => setRoutineSlug(value ?? "freestyle")}
          >
            <SelectTrigger id="start-workout-routine" className="w-full">
              <SelectValue>{selectedRoutineName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freestyle">
                <span className="flex items-center gap-2">
                  <Play data-icon="inline-start" />
                  Freestyle workout
                </span>
              </SelectItem>
              {routines.map((routine) => (
                <SelectItem key={routine.slug} value={routine.slug}>
                  {routine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {startError ? (
            <p role="alert" className="text-sm text-destructive">
              {startError}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="lg"
            disabled={isStarting}
            onClick={() => void handleStart()}
          >
            <Play data-icon="inline-start" />
            {isStarting ? "Starting…" : "Start workout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
