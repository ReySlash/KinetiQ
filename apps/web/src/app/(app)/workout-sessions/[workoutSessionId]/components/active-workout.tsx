"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StyledLink from "@/components/styled-link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  RecordWorkoutSetInput,
  WorkoutSession,
} from "@/types/workout-session-types";

type ActiveWorkoutProps = {
  session: WorkoutSession;
  onRecordSet: (
    exercisePerformanceId: string,
    input: RecordWorkoutSetInput,
  ) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  onDeleteSet?: (completedSetId: string) => void | Promise<void>;
  onUpdateSet?: (
    completedSetId: string,
    input: Partial<RecordWorkoutSetInput>,
  ) => void | Promise<void>;
};

function exerciseSlugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ActiveWorkout({
  session,
  onRecordSet,
  isSubmitting = false,
  error = null,
  onDeleteSet,
  onUpdateSet,
}: ActiveWorkoutProps) {
  const [performanceIndex, setPerformanceIndex] = useState(0);
  const performance = session.performances[performanceIndex];
  const [repetitions, setRepetitions] = useState("");
  const [load, setLoad] = useState("");
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [originalEdit, setOriginalEdit] = useState<{ repetitions: string; load: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!performance) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Add an exercise to begin recording your workout.
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (editingSetId && onUpdateSet) {
      const changes: Partial<RecordWorkoutSetInput> = {};
      if (!originalEdit || repetitions !== originalEdit.repetitions) changes.repetitions = Number(repetitions);
      if (!originalEdit || load.trim() !== originalEdit.load) changes.load = load.trim();
      void onUpdateSet(editingSetId, changes);
      setEditingSetId(null);
      setOriginalEdit(null);
      return;
    }
    void onRecordSet(performance.id, { repetitions: Number(repetitions), load: load.trim(), loadUnit: "KG" });
  }

  const prescription = [
    performance.targetMinReps,
    performance.targetMaxReps,
  ].every((value) => value !== null)
    ? `${performance.targetMinReps}–${performance.targetMaxReps} reps`
    : "Flexible reps";

  return (
    <div className="grid gap-3">
      {session.performances.length > 1 && (
        <div className="grid gap-1" aria-label="Workout exercises">
          <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Exercises</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {session.performances.map((item, index) => (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={index === performanceIndex ? "secondary" : "outline"}
                      className="h-auto justify-between gap-3 px-3 py-3 text-left"
                      aria-label={item.exerciseNameSnapshot}
                      onClick={() => {
                        setPerformanceIndex(index);
                        setValidationError(null);
                      }}
                    />
                  }
                >
                  <span className="truncate">{item.exerciseNameSnapshot}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.completedSets.length}/{item.targetSetCount ?? "—"}</span>
                </TooltipTrigger>
                <TooltipContent>Select {item.exerciseNameSnapshot}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
      <Card className="border-border/70 bg-card/80">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-2xl">
            {performance.exerciseNameSnapshot}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger
              render={<span className="inline-flex" />}
            >
              <StyledLink
                variant="outline"
                size="sm"
                href={`/exercises/${exerciseSlugFromName(performance.exerciseNameSnapshot)}`}
              >
                View exercise
              </StyledLink>
            </TooltipTrigger>
            <TooltipContent>View exercise details</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          {performance.targetSetCount ?? "—"} sets · {prescription}
        </p>
        {performance.targetRir !== null && (
          <p className="text-sm text-muted-foreground">
            Target RIR {performance.targetRir}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {validationError && <p role="alert" className="text-sm text-destructive">{validationError}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {performance.completedSets.length > 0 && (
            <div className="grid gap-2" aria-label="Completed sets">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Completed sets</p>
              {performance.completedSets.map((completedSet) => (
                <div key={completedSet.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm">
                  <span>{completedSet.loadKg} {completedSet.loadUnit.toLowerCase()} × {completedSet.repetitions} reps{completedSet.rir !== null ? ` · RIR ${completedSet.rir}` : ""}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    {onUpdateSet && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit set"
                              onClick={() => { setEditingSetId(completedSet.id); setOriginalEdit({ repetitions: String(completedSet.repetitions), load: completedSet.loadKg }); setRepetitions(String(completedSet.repetitions)); setLoad(completedSet.loadKg); }}
                              disabled={isSubmitting}
                            />
                          }
                        >
                          Edit
                        </TooltipTrigger>
                        <TooltipContent>Edit set</TooltipContent>
                      </Tooltip>
                    )}
                    {onDeleteSet && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              aria-label="Delete set"
                              onClick={() => void onDeleteSet(completedSet.id)}
                              disabled={isSubmitting}
                            />
                          }
                        >
                          <Trash2 />
                        </TooltipTrigger>
                        <TooltipContent>Delete set</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workout-repetitions">Repetitions</Label>
              <Input
                id="workout-repetitions"
                inputMode="numeric"
                value={repetitions}
                onChange={(event) => setRepetitions(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workout-load">Load (kg)</Label>
              <Input
                id="workout-load"
                inputMode="decimal"
                value={load}
                onChange={(event) => setLoad(event.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isSubmitting}
                    aria-label={editingSetId ? "Save set" : "Record set"}
                    className="!border-primary text-primary hover:!bg-primary hover:!text-black"
                  />
                }
              >
                {isSubmitting ? "Saving set…" : editingSetId ? "Save set" : "Record set"}
              </TooltipTrigger>
              <TooltipContent>{editingSetId ? "Save set" : "Record set"}</TooltipContent>
            </Tooltip>
          </div>
        </form>
      </CardContent>
      </Card>
    </div>
  );
}
