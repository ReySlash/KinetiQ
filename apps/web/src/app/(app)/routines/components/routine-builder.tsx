"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { BookOpen, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { createRoutine, updateRoutine } from "@/lib/routines-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import type { RoutineCreateInput, RoutineDetail } from "@/types/routine-types";
import Link from "next/link";

const optionalInteger = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.coerce.number().int().min(min).max(max).nullable(),
  );

const routineExerciseSchema = z.object({
  exerciseSlug: z.string().min(1),
  sets: z.coerce.number().int().min(1).max(20),
  minReps: z.coerce.number().int().min(1).max(1000),
  maxReps: z.coerce.number().int().min(1).max(1000),
  targetRir: optionalInteger(0, 10),
  restSeconds: optionalInteger(0, 3600),
  tempo: z.string().max(30).optional(),
  notes: z.string().max(1000).optional(),
});

const routineSchema = z
  .object({
    name: z.string().trim().min(2, "Use at least 2 characters.").max(120),
    description: z.string().max(2000).optional(),
    exercises: z.array(routineExerciseSchema),
  })
  .superRefine((value, context) => {
    value.exercises.forEach((exercise, index) => {
      if (exercise.minReps > exercise.maxReps) {
        context.addIssue({
          code: "custom",
          message: "Minimum reps cannot exceed maximum reps.",
          path: ["exercises", index, "minReps"],
        });
      }
    });
  });

type FormInput = z.input<typeof routineSchema>;
type FormValues = z.output<typeof routineSchema>;

function getDefaults(
  routine?: RoutineDetail,
  initialExerciseSlug?: string,
): FormInput {
  if (routine) {
    const exercises: z.input<typeof routineExerciseSchema>[] =
      routine.exercises.map((exercise) => ({
        exerciseSlug: exercise.exerciseSlug,
        sets: exercise.sets,
        minReps: exercise.minReps,
        maxReps: exercise.maxReps,
        targetRir: exercise.targetRir,
        restSeconds: exercise.restSeconds,
        tempo: exercise.tempo ?? "",
        notes: exercise.notes ?? "",
      }));

    if (initialExerciseSlug) {
      exercises.push({
        exerciseSlug: initialExerciseSlug,
        sets: "",
        minReps: "",
        maxReps: "",
        targetRir: null,
        restSeconds: null,
        tempo: "",
        notes: "",
      });
    }

    return {
      name: routine.name,
      description: routine.description ?? "",
      exercises,
    };
  }

  return {
    name: "",
    description: "",
    exercises: initialExerciseSlug
      ? [
          {
            exerciseSlug: initialExerciseSlug,
            sets: "",
            minReps: "",
            maxReps: "",
            targetRir: null,
            restSeconds: null,
            tempo: "",
            notes: "",
          },
        ]
      : [],
  };
}

export function RoutineBuilder({
  routine,
  initialExerciseSlug,
}: {
  routine?: RoutineDetail;
  initialExerciseSlug?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: getDefaults(routine, initialExerciseSlug),
  });
  const fields = useFieldArray({ control: form.control, name: "exercises" });
  const mutation = useMutation({
    mutationFn: (input: RoutineCreateInput) =>
      routine ? updateRoutine(routine.slug, input) : createRoutine(input),
  });

  async function handleBrowseExercises(event: MouseEvent<HTMLAnchorElement>) {
    if (routine) return;

    const name = form.getValues("name").trim();
    if (!name) return;

    event.preventDefault();
    const isValidName = await form.trigger("name");
    if (!isValidName) return;

    const description = form.getValues("description")?.trim() || null;
    mutation.mutate(
      { name, description, exercises: [] },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["routines"] });
          router.push("/exercises");
        },
      },
    );
  }

  function onSubmit(values: FormValues) {
    mutation.mutate(
      {
        name: values.name,
        description: values.description?.trim() || null,
        exercises: values.exercises.map((exercise) => ({
          ...exercise,
          targetRir: exercise.targetRir ?? null,
          restSeconds: exercise.restSeconds ?? null,
          tempo: exercise.tempo?.trim() || null,
          notes: exercise.notes?.trim() || null,
        })),
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["routines"] });
          router.push("/routines");
        },
      },
    );
  }

  return (
    <main className="flex h-dvh w-full flex-col gap-2 overflow-auto px-1 pb-13 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Reusable workout templates for your training.">
        <Link
          href="/routines"
          className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
          Routines
        </Link>
        <span className="text-lg leading-none text-muted-foreground">
          <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-bold leading-none">
          {routine ? "Edit routine" : "New routine"}
        </h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto space-y-2 rounded-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full h-full flex-col gap-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Routine details</CardTitle>
              <CardDescription>
                Name this template and describe when to use it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="md:grid md:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.name)}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Upper body A"
                    {...form.register("name")}
                    aria-invalid={Boolean(form.formState.errors.name)}
                  />
                  {form.formState.errors.name && (
                    <FieldError errors={[form.formState.errors.name]} />
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="A focused pressing session"
                    {...form.register("description")}
                  />
                  <FieldDescription>
                    Keep the context useful when you return to this routine.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                Complete the prescription for each exercise before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center">
                  <BookOpen className="size-6 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Browse the exercise library to choose an exercise for this
                    routine.
                  </p>
                  <StyledLink
                    href="/exercises"
                    variant="outline"
                    onClick={handleBrowseExercises}
                  >
                    {mutation.isPending
                      ? "Saving routine…"
                      : "Browse exercises"}
                  </StyledLink>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-border/70 bg-background/30 p-4"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{field.exerciseSlug}</p>
                          <p className="text-xs text-muted-foreground">
                            Exercise reference
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fields.remove(index)}
                          aria-label={`Remove ${field.exerciseSlug}`}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <PrescriptionField
                          label="Sets"
                          id={`sets-${field.id}`}
                          error={form.formState.errors.exercises?.[index]?.sets}
                        >
                          <Input
                            id={`sets-${field.id}`}
                            type="number"
                            min="1"
                            max="20"
                            {...form.register(`exercises.${index}.sets`)}
                          />
                        </PrescriptionField>
                        <PrescriptionField
                          label="Min reps"
                          id={`min-reps-${field.id}`}
                          error={
                            form.formState.errors.exercises?.[index]?.minReps
                          }
                        >
                          <Input
                            id={`min-reps-${field.id}`}
                            type="number"
                            min="1"
                            max="1000"
                            {...form.register(`exercises.${index}.minReps`)}
                          />
                        </PrescriptionField>
                        <PrescriptionField
                          label="Max reps"
                          id={`max-reps-${field.id}`}
                          error={
                            form.formState.errors.exercises?.[index]?.maxReps
                          }
                        >
                          <Input
                            id={`max-reps-${field.id}`}
                            type="number"
                            min="1"
                            max="1000"
                            {...form.register(`exercises.${index}.maxReps`)}
                          />
                        </PrescriptionField>
                        <PrescriptionField
                          label="Target RIR"
                          id={`rir-${field.id}`}
                          error={
                            form.formState.errors.exercises?.[index]?.targetRir
                          }
                        >
                          <Input
                            id={`rir-${field.id}`}
                            type="number"
                            min="0"
                            max="10"
                            {...form.register(`exercises.${index}.targetRir`)}
                          />
                        </PrescriptionField>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <PrescriptionField
                          label="Rest seconds"
                          id={`rest-${field.id}`}
                          error={
                            form.formState.errors.exercises?.[index]
                              ?.restSeconds
                          }
                        >
                          <Input
                            id={`rest-${field.id}`}
                            type="number"
                            min="0"
                            max="3600"
                            {...form.register(`exercises.${index}.restSeconds`)}
                          />
                        </PrescriptionField>
                        <PrescriptionField
                          label="Tempo"
                          id={`tempo-${field.id}`}
                          error={
                            form.formState.errors.exercises?.[index]?.tempo
                          }
                        >
                          <Input
                            id={`tempo-${field.id}`}
                            placeholder="3-1-X-0"
                            {...form.register(`exercises.${index}.tempo`)}
                          />
                        </PrescriptionField>
                        <PrescriptionField
                          label="Notes"
                          id={`notes-${field.id}`}
                          error={
                            form.formState.errors.exercises?.[index]?.notes
                          }
                        >
                          <Input
                            id={`notes-${field.id}`}
                            placeholder="Controlled reps"
                            {...form.register(`exercises.${index}.notes`)}
                          />
                        </PrescriptionField>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}
          <div className="flex  gap-2 sm:flex-row justify-center md:justify-end">
            <StyledLink size="lg" href="/routines" variant="outline">
              Cancel
            </StyledLink>
            <Button size="lg" type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving…"
                : routine
                  ? "Save changes"
                  : "Save routine"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

function PrescriptionField({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: { message?: string };
  children: React.ReactNode;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
}
