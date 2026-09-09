"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { listExercises } from "@/lib/routines-api";
import type { ExerciseOption } from "@/types/routine-types";
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
import { Input } from "@/components/ui/input";
import StyledLink from "@/components/styled-link";
import { cn } from "@/lib/utils";

export function RoutineExercisePicker({
  selectedExerciseSlugs,
  onAddExercise,
  className,
}: {
  selectedExerciseSlugs: string[];
  onAddExercise: (exercise: ExerciseOption) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const exercises = useQuery({
    queryKey: ["routine-exercise-picker", debouncedSearch],
    queryFn: () => listExercises(debouncedSearch),
    enabled: open && debouncedSearch.length >= 3,
  });
  const selected = new Set(selectedExerciseSlugs);

  function handleAdd(exercise: ExerciseOption) {
    onAddExercise(exercise);
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setDebouncedSearch("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={cn(
              "h-10 cursor-pointer !border-primary/50 bg-primary/5 text-primary hover:!border-primary hover:!bg-primary hover:!text-black",
              className,
            )}
          />
        }
      >
        <Plus data-icon="inline-start" />
        Add exercise
      </DialogTrigger>
      <DialogContent className="h-[min(36rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>
            Choose an exercise to add to this routine.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-3">
          <Input
            aria-label="Search exercises"
            placeholder="Search exercises"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {!search.trim() && (
              <p className="py-4 text-sm text-muted-foreground">
                Type at least 3 characters to search exercises.
              </p>
            )}
            {search.trim().length > 0 && search.trim().length < 3 && (
              <p className="py-4 text-sm text-muted-foreground">
                Enter at least 3 characters to search.
              </p>
            )}
            {debouncedSearch.length >= 3 && exercises.isLoading && (
              <p className="py-4 text-sm text-muted-foreground">
                Loading exercises…
              </p>
            )}
            {debouncedSearch.length >= 3 && exercises.isError && (
              <p role="alert" className="py-4 text-sm text-destructive">
                Unable to load exercises.
              </p>
            )}
            {debouncedSearch.length >= 3 && exercises.data?.map((exercise) => {
              const isSelected = selected.has(exercise.slug);
              return (
                <Button
                  key={exercise.slug}
                  type="button"
                  variant="ghost"
                  className="h-auto justify-start py-2 text-left"
                  disabled={isSelected}
                  onClick={() => handleAdd(exercise)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {exercise.name}
                  </span>
                  {isSelected ? (
                    <span className="text-xs text-muted-foreground">
                      Added
                    </span>
                  ) : null}
                </Button>
              );
            })}
            {debouncedSearch.length >= 3 &&
            exercises.data?.length === 0 &&
            !exercises.isLoading ? (
              <p className="py-4 text-sm text-muted-foreground">
                No exercises match your search.
              </p>
            ) : null}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <StyledLink
            href="/exercises"
            variant="default"
            size="lg"
            className="self-center sm:self-start"
          >
            Browse all exercises
          </StyledLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
