"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createTrainingProgram,
  updateTrainingProgram,
  type TrainingProgramCreateInput,
} from "@/lib/training-programs-api";
import type { RoutineListItem } from "@/types/routine-types";
import type { TrainingProgramDetail } from "@/types/training-program-types";

const scheduleEntrySchema = z.object({
  routineSlug: z.string().min(1, "Choose a routine."),
  weekNumber: z.coerce.number().int().min(1),
  dayNumber: z.coerce.number().int().min(1),
  notes: z.string().max(1000).optional(),
});

const trainingProgramSchema = z
  .object({
    name: z.string().trim().min(2, "Use at least 2 characters.").max(120),
    description: z.string().max(2000).optional(),
    durationWeeks: z.coerce.number().int().min(1),
    schedule: z.array(scheduleEntrySchema),
  })
  .superRefine((value, context) => {
    const slots = new Set<string>();
    value.schedule.forEach((entry, index) => {
      if (entry.weekNumber > value.durationWeeks) {
        context.addIssue({
          code: "custom",
          message: "The week cannot exceed the program duration.",
          path: ["schedule", index, "weekNumber"],
        });
      }

      const slot = `${entry.weekNumber}:${entry.dayNumber}`;
      if (slots.has(slot)) {
        context.addIssue({
          code: "custom",
          message: "Each week and day slot can contain only one routine.",
          path: ["schedule", index, "dayNumber"],
        });
      }
      slots.add(slot);
    });
  });

type FormInput = z.input<typeof trainingProgramSchema>;
type FormValues = z.output<typeof trainingProgramSchema>;

export function TrainingProgramBuilder({
  routines,
  program,
}: {
  routines: RoutineListItem[];
  program?: TrainingProgramDetail;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(trainingProgramSchema),
    defaultValues: {
      name: program?.name ?? "",
      description: program?.description ?? "",
      durationWeeks: program?.durationWeeks.toString() ?? "1",
      schedule:
        program?.schedule.map((entry) => ({
          routineSlug: entry.routine.slug,
          weekNumber: entry.weekNumber.toString(),
          dayNumber: entry.dayNumber.toString(),
          notes: entry.notes ?? "",
        })) ?? [],
    },
  });
  const fields = useFieldArray({ control: form.control, name: "schedule" });
  const mutation = useMutation({
    mutationFn: (input: TrainingProgramCreateInput) =>
      program
        ? updateTrainingProgram(program.slug, input)
        : createTrainingProgram(input),
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(
      {
        name: values.name,
        description: values.description?.trim() || null,
        durationWeeks: values.durationWeeks,
        schedule: values.schedule.map((entry) => ({
          ...entry,
          notes: entry.notes?.trim() || null,
        })),
      },
      {
        onSuccess: async ({ slug }) => {
          await queryClient.invalidateQueries({
            queryKey: ["training-programs"],
          });
          router.push(`/training-programs/${slug}`);
        },
      },
    );
  }

  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-auto px-0.5 pb-14 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader
        subtitle={
          program
            ? "Edit a reusable multi-week training template."
            : "Create a reusable multi-week training template."
        }
      >
        <Link
          className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground"
          href="/training-programs"
        >
          Training Programs
        </Link>
        <span className="text-lg leading-none text-muted-foreground">
          {" > "}
        </span>
        <h1 className="text-lg font-bold leading-none">
          {program ? "Edit Training Program" : "New Training Program"}
        </h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto space-y-2 rounded-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Program details</CardTitle>
              <CardDescription>
                Name the program and define its duration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="md:grid md:grid-cols-3">
                <Field
                  className="md:col-span-2"
                  data-invalid={Boolean(form.formState.errors.name)}
                >
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Strength foundation"
                    {...form.register("name")}
                    aria-invalid={Boolean(form.formState.errors.name)}
                  />
                  {form.formState.errors.name && (
                    <FieldError errors={[form.formState.errors.name]} />
                  )}
                </Field>
                <Field
                  data-invalid={Boolean(form.formState.errors.durationWeeks)}
                >
                  <FieldLabel htmlFor="durationWeeks">
                    Duration in weeks
                  </FieldLabel>
                  <Input
                    id="durationWeeks"
                    type="number"
                    min="1"
                    {...form.register("durationWeeks")}
                    aria-invalid={Boolean(form.formState.errors.durationWeeks)}
                  />
                  {form.formState.errors.durationWeeks && (
                    <FieldError
                      errors={[form.formState.errors.durationWeeks]}
                    />
                  )}
                </Field>
                <Field className="md:col-span-3">
                  <FieldLabel htmlFor="description">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="A simple structure for building consistent training."
                    {...form.register("description")}
                  />
                  <FieldDescription>
                    Keep the context useful when you return to this program.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>
                  Place existing private or global routines into relative weeks
                  and training days.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  fields.append({
                    routineSlug: "",
                    weekNumber: "1",
                    dayNumber: String(fields.fields.length + 1),
                    notes: "",
                  })
                }
              >
                <Plus />
                Add routine
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.fields.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No routines scheduled yet. You can create the program now
                    and add its schedule later.
                  </p>
                </div>
              ) : (
                fields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-2xl border border-border/70 bg-background/30 p-4"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Training day {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          Choose a routine and its relative position.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fields.remove(index)}
                        aria-label={`Remove training day ${index + 1}`}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      <Field
                        className="md:col-span-2"
                        data-invalid={Boolean(
                          form.formState.errors.schedule?.[index]?.routineSlug,
                        )}
                      >
                        <FieldLabel htmlFor={`routine-${field.id}`}>
                          Routine
                        </FieldLabel>
                        <Controller
                          control={form.control}
                          name={`schedule.${index}.routineSlug`}
                          render={({ field: controllerField }) => (
                            <RoutinePicker
                              routines={routines}
                              value={controllerField.value}
                              onChange={controllerField.onChange}
                            />
                          )}
                        />
                        {form.formState.errors.schedule?.[index]
                          ?.routineSlug && (
                          <FieldError
                            errors={[
                              form.formState.errors.schedule[index].routineSlug,
                            ]}
                          />
                        )}
                      </Field>
                      <Field
                        data-invalid={Boolean(
                          form.formState.errors.schedule?.[index]?.weekNumber,
                        )}
                      >
                        <FieldLabel htmlFor={`week-${field.id}`}>
                          Week
                        </FieldLabel>
                        <Input
                          id={`week-${field.id}`}
                          type="number"
                          min="1"
                          {...form.register(`schedule.${index}.weekNumber`)}
                        />
                        {form.formState.errors.schedule?.[index]
                          ?.weekNumber && (
                          <FieldError
                            errors={[
                              form.formState.errors.schedule[index].weekNumber,
                            ]}
                          />
                        )}
                      </Field>
                      <Field
                        data-invalid={Boolean(
                          form.formState.errors.schedule?.[index]?.dayNumber,
                        )}
                      >
                        <FieldLabel htmlFor={`day-${field.id}`}>Day</FieldLabel>
                        <Input
                          id={`day-${field.id}`}
                          type="number"
                          min="1"
                          {...form.register(`schedule.${index}.dayNumber`)}
                        />
                        {form.formState.errors.schedule?.[index]?.dayNumber && (
                          <FieldError
                            errors={[
                              form.formState.errors.schedule[index].dayNumber,
                            ]}
                          />
                        )}
                      </Field>
                    </div>
                    <Field className="mt-3">
                      <FieldLabel htmlFor={`notes-${field.id}`}>
                        Notes{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={`notes-${field.id}`}
                        placeholder="Optional context for this scheduled day"
                        {...form.register(`schedule.${index}.notes`)}
                      />
                      {form.formState.errors.schedule?.[index]?.notes && (
                        <FieldError
                          errors={[form.formState.errors.schedule[index].notes]}
                        />
                      )}
                    </Field>
                  </div>
                ))
              )}
              {routines.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No routines are available yet. Create a routine before adding
                  one to this program.
                </p>
              )}
            </CardContent>
          </Card>

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}
          <div className="flex justify-center gap-2 md:justify-end">
            <StyledLink
              size="lg"
              href={program ? `/training-programs/${program.slug}` : "/training-programs"}
              variant="outline"
            >
              Cancel
            </StyledLink>
            <Button size="lg" type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? program
                  ? "Saving…"
                  : "Creating…"
                : program
                  ? "Save changes"
                  : "Create training program"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

type RoutinePickerProps = {
  routines: RoutineListItem[];
  value: string;
  onChange: (value: string) => void;
};

function RoutinePicker({ routines, value, onChange }: RoutinePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedRoutine = routines.find((routine) => routine.slug === value);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  }

  function renderRoutineList(scope: "all" | "global" | "my") {
    const normalizedSearch = search.trim().toLowerCase();
    const filteredRoutines = routines.filter((routine) => {
      const matchesScope =
        scope === "all" ||
        (scope === "global" && routine.visibility === "GLOBAL") ||
        (scope === "my" && routine.visibility === "PRIVATE");
      const matchesSearch =
        !normalizedSearch ||
        routine.name.toLowerCase().includes(normalizedSearch) ||
        routine.description?.toLowerCase().includes(normalizedSearch);
      return matchesScope && matchesSearch;
    });

    if (filteredRoutines.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No routines match your search.
        </p>
      );
    }

    return (
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {filteredRoutines.map((routine) => (
          <button
            key={routine.slug}
            type="button"
            className="flex w-full items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/30 p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
            onClick={() => {
              onChange(routine.slug);
              setOpen(false);
              setSearch("");
            }}
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{routine.name}</span>
              <span className="mt-1 block line-clamp-2 text-xs text-muted-foreground">
                {routine.description || "No description yet."}
              </span>
              <span className="mt-2 block text-xs text-muted-foreground">
                {routine.exerciseCount} {routine.exerciseCount === 1 ? "exercise" : "exercises"}
                {" · "}
                {routine.visibility === "GLOBAL" ? "Global" : "Private"}
              </span>
            </span>
            {routine.slug === value && <Check className="mt-0.5 size-4 shrink-0 text-primary" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button type="button" variant="outline" className="w-full justify-start" />}
      >
        {selectedRoutine ? selectedRoutine.name : "Choose a routine"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose a routine</DialogTitle>
          <DialogDescription>
            Search your routines and global templates, then assign one to this training day.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search routines by name or description"
            className="pl-9"
            aria-label="Search routines"
          />
        </div>
        <Tabs defaultValue="all">
          <TabsList aria-label="Routine scope" className="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="my">My routines</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderRoutineList("all")}</TabsContent>
          <TabsContent value="global">{renderRoutineList("global")}</TabsContent>
          <TabsContent value="my">{renderRoutineList("my")}</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
