import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { MoreLink } from "@/components/more-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchTrainingProgram } from "@/lib/training-programs-server";
import type { TrainingProgramDetail } from "@/types/training-program-types";
import { TrainingProgramActions } from "./training-program-actions";
import { AdoptTrainingProgramControl } from "../components/adopt-training-program-control";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function groupSchedule(schedule: TrainingProgramDetail["schedule"]) {
  const weeks = new Map<number, typeof schedule>();
  for (const entry of schedule) {
    const week = weeks.get(entry.weekNumber) ?? [];
    week.push(entry);
    weeks.set(entry.weekNumber, week);
  }
  return Array.from(weeks.entries());
}

export default async function TrainingProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await fetchTrainingProgram(slug);
  if (!program) notFound();

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Training program overview.">
        <Link
          className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
          href="/training-programs"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
          Training Programs
        </Link>
        <span className="text-lg leading-none text-muted-foreground">
          <ChevronRight
            className="size-4 shrink-0 self-center text-muted-foreground"
            aria-hidden="true"
          />
        </span>
        <h1 className="text-lg font-bold leading-none">{program.name}</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto rounded-lg md:rounded-2xl">
        <div className="flex flex-col gap-2">
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>{program.name}</CardTitle>
              <CardDescription>
                {program.description || "No description yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>
                  {program.durationWeeks}{" "}
                  {program.durationWeeks === 1 ? "week" : "weeks"}
                </span>
                <span>
                  {program.visibility === "GLOBAL"
                    ? "Global program"
                    : "Private program"}
                </span>
                <span>Updated {formatDate(program.updatedAt)}</span>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <AdoptTrainingProgramControl
                  slug={program.slug}
                  name={program.name}
                  durationWeeks={program.durationWeeks}
                  scheduledWorkoutCount={program.schedule.length}
                />
                {program.visibility === "PRIVATE" ? (
                  <TrainingProgramActions slug={program.slug} />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {groupSchedule(program.schedule).length === 0 ? (
                <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  This program has no scheduled routines yet.
                </p>
              ) : (
                groupSchedule(program.schedule).map(([weekNumber, entries]) => (
                  <section key={weekNumber} className="space-y-3">
                    <h3 className="font-medium">Week {weekNumber}</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {entries.map((entry) => (
                        <article
                          key={`${entry.weekNumber}-${entry.dayNumber}`}
                          className="rounded-2xl border border-border/70 bg-background/30 p-4"
                        >
                          <p className="text-xs text-muted-foreground">
                            Day {entry.dayNumber}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="font-medium">{entry.routine.name}</p>
                            <MoreLink
                              href={`/routines/${entry.routine.slug}`}
                              tooltip="Open routine details"
                              ariaLabel={`Open ${entry.routine.name}`}
                            />
                          </div>
                          {entry.notes && (
                            <p className="mt-3 text-sm text-muted-foreground">
                              {entry.notes}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
