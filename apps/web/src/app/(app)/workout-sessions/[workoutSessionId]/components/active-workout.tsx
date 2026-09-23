"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreLink } from "@/components/more-link";
import ImageWithFallback from "@/components/image-with-fallback";
import { getLocalImageSrc } from "@/lib/local-image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteSetDialog } from "./delete-set-dialog";
import { EditSetDialog } from "./edit-set-dialog";
import { RestTimer } from "./rest-timer";
import StyledLink from "@/components/styled-link";
import type {
  RecordWorkoutSetInput,
  WorkoutSession,
} from "@/types/workout-session-types";

type ActiveWorkoutProps = {
  session: WorkoutSession;
  exercisePerformanceId?: string;
  onRecordSet: (
    exercisePerformanceId: string,
    input: RecordWorkoutSetInput,
  ) => void | boolean | Promise<void | boolean>;
  isSubmitting?: boolean;
  error?: string | null;
  onDeleteSet?: (completedSetId: string) => void | Promise<void>;
  onUpdateSet?: (
    completedSetId: string,
    input: Partial<RecordWorkoutSetInput>,
  ) => void | Promise<void>;
  onRequestFinish?: () => void;
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
  exercisePerformanceId,
  onRecordSet,
  isSubmitting = false,
  error = null,
  onDeleteSet,
  onUpdateSet,
  onRequestFinish,
}: ActiveWorkoutProps) {
  const [performanceIndex, setPerformanceIndex] = useState(0);
  const focusedIndex = exercisePerformanceId
    ? session.performances.findIndex(
        (item) => item.id === exercisePerformanceId,
      )
    : -1;
  const performance =
    focusedIndex >= 0
      ? session.performances[focusedIndex]
      : session.performances[performanceIndex];
  const initialRir =
    performance?.targetRir === null || performance?.targetRir === undefined
      ? ""
      : String(performance.targetRir);
  const [repetitions, setRepetitions] = useState("");
  const [load, setLoad] = useState("");
  const [rir, setRir] = useState(initialRir);
  const [restTimerKey, setRestTimerKey] = useState(0);
  const [editingSet, setEditingSet] = useState<{
    id: string;
    repetitions: number;
    load: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null);

  if (!performance) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Add an exercise to begin recording your workout.
        </CardContent>
      </Card>
    );
  }

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
    const recorded = await onRecordSet(performance.id, {
      repetitions: Number(repetitions),
      load: load.trim(),
      loadUnit: "KG",
      rir: rir.trim() ? Number(rir) : null,
    });
    if (recorded !== false) {
      setRepetitions("");
      setLoad("");
      setRir(
        performance.targetRir === null
          ? ""
          : String(performance.targetRir ?? ""),
      );
      setRestTimerKey((value) => value + 1);
    }
  }

  const prescription = [
    performance.targetMinReps,
    performance.targetMaxReps,
  ].every((value) => value !== null)
    ? `${performance.targetMinReps}–${performance.targetMaxReps} reps`
    : "Flexible reps";
  const nextPerformance = session.performances[focusedIndex + 1];

  return (
    <div className="grid gap-1">
      {!exercisePerformanceId && session.performances.length > 1 && (
        <div className="grid gap-1" aria-label="Workout exercises">
          <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Exercises
          </p>
          <div className="grid gap-1 sm:grid-cols-2">
            {session.performances.map((item, index) => (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={
                        index === performanceIndex ? "secondary" : "outline"
                      }
                      className="h-auto justify-between gap-3 px-3 py-3 text-left"
                      aria-label={item.exerciseNameSnapshot}
                      onClick={() => {
                        setPerformanceIndex(index);
                        setRepetitions("");
                        setLoad("");
                        setRestTimerKey(0);
                        setRir(
                          item.targetRir === null
                            ? ""
                            : String(item.targetRir ?? ""),
                        );
                        setValidationError(null);
                      }}
                    />
                  }
                >
                  <span className="truncate">{item.exerciseNameSnapshot}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.completedSets.length}/{item.targetSetCount ?? "—"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Select {item.exerciseNameSnapshot}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
      <Card className="gap-1 border-border/70 bg-card/80 p-1">
        <CardHeader className="gap-1">
          <div className="flex items-center justify-between gap-4">
            <ImageWithFallback
              className="size-17.5 shrink-0 rounded-xl border border-border/70 object-cover"
              src={getLocalImageSrc(
                "exercises",
                exerciseSlugFromName(performance.exerciseNameSnapshot),
              )}
              alt={`${performance.exerciseNameSnapshot} thumbnail`}
              width={160}
              height={120}
              fallbackSrc="/assets/empty-state-exercises.webp"
            />
            <div className="grid flex-1 justify-items-center gap-2 text-center text-sm text-muted-foreground">
              <p>
                {performance.targetSetCount ?? "—"} sets · {prescription}
              </p>
              {performance.targetRir !== null && (
                <p>Target RIR {performance.targetRir}</p>
              )}
            </div>
            <MoreLink
              href={`/exercises/${exerciseSlugFromName(performance.exerciseNameSnapshot)}`}
              tooltip="View exercise details"
            />
          </div>
          {performance.completedSets.length > 0 && (
            <div className="grid gap-1" aria-label="Completed sets">
              <p className="text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Completed sets
              </p>
              {performance.completedSets.map((completedSet) => (
                <div
                  key={completedSet.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm"
                >
                  <span>
                    {completedSet.loadKg} {completedSet.loadUnit.toLowerCase()}{" "}
                    × {completedSet.repetitions} reps
                    {completedSet.rir !== null
                      ? ` · RIR ${completedSet.rir}`
                      : ""}
                  </span>
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
                              onClick={() => {
                                setEditingSet({
                                  id: completedSet.id,
                                  repetitions: completedSet.repetitions,
                                  load: completedSet.loadKg,
                                });
                              }}
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
                              onClick={() => setDeleteSetId(completedSet.id)}
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
        </CardHeader>
        <CardContent className="gap-1">
          <form onSubmit={handleSubmit} className="grid gap-1">
            {validationError && (
              <p role="alert" className="text-sm text-destructive">
                {validationError}
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
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
            <div className="grid gap-2">
              <Label htmlFor="workout-rir">RIR (optional)</Label>
              <Input
                id="workout-rir"
                inputMode="numeric"
                value={rir}
                onChange={(event) => setRir(event.target.value)}
              />
            </div>
            <div className="flex justify-center md:justify-end p-1">
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                aria-label="Record set"
                className="border-primary! text-primary hover:bg-primary! hover:text-black!"
              >
                {isSubmitting ? "Saving set…" : "Record set"}
              </Button>
            </div>
          </form>
          {exercisePerformanceId &&
          performance.targetRestSeconds !== null &&
          performance.targetRestSeconds !== undefined ? (
            <div className="p-1">
              <RestTimer
                key={`${performance.id}-${restTimerKey}`}
                seconds={performance.targetRestSeconds}
                autoStart={restTimerKey > 0}
                storageKey={`kinetiq:rest-timer:${session.id}:${performance.id}`}
                startFresh={restTimerKey > 0}
              />
            </div>
          ) : null}
          {exercisePerformanceId ? (
            <div className="flex justify-center gap-2">
              <StyledLink
                href={`/workout-sessions/${session.id}`}
                variant="outline"
              >
                Back to workout
              </StyledLink>
              {nextPerformance ? (
                <StyledLink
                  href={`/workout-sessions/${session.id}/exercises/${nextPerformance.id}`}
                >
                  Next exercise
                </StyledLink>
              ) : onRequestFinish ? (
                <Button type="button" onClick={onRequestFinish}>
                  Finish workout
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <DeleteSetDialog
        open={deleteSetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteSetId(null);
        }}
        onConfirm={async () => {
          if (!deleteSetId || !onDeleteSet) return;
          await onDeleteSet(deleteSetId);
          setDeleteSetId(null);
        }}
      />
      {editingSet ? (
        <EditSetDialog
          key={editingSet.id}
          open
          onOpenChange={(open) => {
            if (!open) setEditingSet(null);
          }}
          repetitions={editingSet.repetitions}
          load={editingSet.load}
          isSubmitting={isSubmitting}
          onConfirm={(input) => {
            if (!onUpdateSet) return;
            return onUpdateSet(editingSet.id, input);
          }}
        />
      ) : null}
    </div>
  );
}
