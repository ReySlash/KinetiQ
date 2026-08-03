import { notFound } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";

import StyledLink from "@/components/styled-link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRoutine } from "@/lib/routines-server";

import { RoutineActions } from "./routine-actions";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function RoutineDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const routine = await fetchRoutine(id);
  if (!routine) notFound();

  const activeExercises = routine.exercises.filter(
    (routineExercise) =>
      routineExercise.exercise.isActive &&
      routineExercise.exercise.archivedAt === null,
  );

  return (
    <main className="flex h-dvh w-full flex-col gap-2 overflow-hidden px-1 md:px-2 md:pb-2 md:pt-0">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <SidebarTrigger className="md:hidden" />
        <div>
          <p className="text-xs text-muted-foreground">Routines</p>
          <h1 className="text-lg font-bold leading-none">{routine.name}</h1>
        </div>
      </header>
      <section className="min-h-0 flex-1 overflow-y-auto rounded-2xl">
        <div className="flex flex-col gap-2">
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>{routine.name}</CardTitle>
              <CardDescription>
                {routine.description || "No description yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>
                  {activeExercises.length}{" "}
                  {activeExercises.length === 1 ? "exercise" : "exercises"}
                </span>
                <span>Updated {formatDate(routine.updatedAt)}</span>
              </div>
              <RoutineActions routineId={routine.id} />
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                Ordered prescriptions for this routine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeExercises.length === 0 ? (
                <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  This routine has no active exercises.
                </p>
              ) : (
                activeExercises.map((routineExercise, index) => (
                  <article
                    key={routineExercise.id}
                    className="rounded-2xl border border-border/70 bg-background/30 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Exercise {index + 1}
                        </p>
                        <h3 className="font-medium">
                          {routineExercise.exercise.name}
                        </h3>
                      </div>
                      <StyledLink
                        href={`/exercises/${routineExercise.exercise.slug}`}
                        variant="outline"
                      >
                        <CiMenuBurger />
                        <span className="sr-only">Open exercise details</span>
                      </StyledLink>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-border/60 py-3 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-muted-foreground">Sets</dt>
                        <dd className="font-medium">{routineExercise.sets}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Rep range</dt>
                        <dd className="font-medium">
                          {routineExercise.minReps}–{routineExercise.maxReps}
                        </dd>
                      </div>
                      {routineExercise.targetRir !== null && (
                        <div>
                          <dt className="text-muted-foreground">Target RIR</dt>
                          <dd className="font-medium">
                            {routineExercise.targetRir}
                          </dd>
                        </div>
                      )}
                      {routineExercise.restSeconds !== null && (
                        <div>
                          <dt className="text-muted-foreground">Rest</dt>
                          <dd className="font-medium">
                            {routineExercise.restSeconds}s
                          </dd>
                        </div>
                      )}
                    </dl>
                    {(routineExercise.tempo || routineExercise.notes) && (
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        {routineExercise.tempo && (
                          <div>
                            <dt className="text-muted-foreground">Tempo</dt>
                            <dd>{routineExercise.tempo}</dd>
                          </div>
                        )}
                        {routineExercise.notes && (
                          <div>
                            <dt className="text-muted-foreground">Notes</dt>
                            <dd>{routineExercise.notes}</dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
