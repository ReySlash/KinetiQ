import { notFound } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import StyledLink from "@/components/styled-link";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRoutine } from "@/lib/routines-server";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { RoutineActions } from "./routine-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const routine = await fetchRoutine(slug);

  if (!routine) return { title: "Routine not found | KinetiQ" };
  return {
    title: `${routine.name} routine | KinetiQ`,
    description:
      routine.description ?? `View the ${routine.name} workout routine.`,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function RoutineDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const routine = await fetchRoutine(slug);
  if (!routine) notFound();

  const activeExercises = routine.exercises.filter(
    (routineExercise) =>
      routineExercise.exercise.isActive &&
      routineExercise.exercise.archivedAt === null,
  );

  return (
    <main className="flex h-dvh w-full flex-col gap-2 overflow-hidden px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Reusable workout template details.">
        <Link
          className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground"
          href="/routines"
        >
          Routines
        </Link>
        <span className="text-lg leading-none text-muted-foreground">{" > "}</span>
        <h1 className="text-lg font-bold leading-none">{routine.name}</h1>
      </PageHeader>
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
              <RoutineActions
                routineSlug={routine.slug}
                visibility={routine.visibility}
              />
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
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <StyledLink
                              href={`/exercises/${routineExercise.exercise.slug}`}
                              variant="outline"
                              aria-label="Open exercise details"
                            >
                              <MoreHorizontal />
                            </StyledLink>
                          }
                        />
                        <TooltipContent>Open exercise details</TooltipContent>
                      </Tooltip>
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
