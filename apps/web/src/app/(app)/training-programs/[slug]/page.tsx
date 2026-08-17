import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrainingProgram } from "@/lib/training-programs-server";
import type { TrainingProgramDetail } from "@/types/training-program-types";
import { TrainingProgramActions } from "./training-program-actions";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
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

export default async function TrainingProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await fetchTrainingProgram(slug);
  if (!program) notFound();

  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Training program overview.">
        <Link
          className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground"
          href="/training-programs"
        >
          Training Programs
        </Link>
        <span className="text-lg leading-none text-muted-foreground">{" > "}</span>
        <h1 className="text-lg font-bold leading-none">{program.name}</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto rounded-2xl">
        <div className="flex flex-col gap-2">
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>{program.name}</CardTitle>
              <CardDescription>{program.description || "No description yet."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>{program.durationWeeks} {program.durationWeeks === 1 ? "week" : "weeks"}</span>
                <span>{program.visibility === "GLOBAL" ? "Global program" : "Private program"}</span>
                <span>Updated {formatDate(program.updatedAt)}</span>
              </div>
              {program.visibility === "PRIVATE" && <TrainingProgramActions slug={program.slug} />}
            </CardContent>
          </Card>

          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Routines arranged across the program&apos;s relative weeks and training days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {groupSchedule(program.schedule).length === 0 ? (
                <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">This program has no scheduled routines yet.</p>
              ) : (
                groupSchedule(program.schedule).map(([weekNumber, entries]) => (
                  <section key={weekNumber} className="space-y-3">
                    <h3 className="font-medium">Week {weekNumber}</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {entries.map((entry) => (
                        <article key={`${entry.weekNumber}-${entry.dayNumber}`} className="rounded-2xl border border-border/70 bg-background/30 p-4">
                          <p className="text-xs text-muted-foreground">Day {entry.dayNumber}</p>
                          <Link className="mt-1 block font-medium text-primary underline-offset-4 hover:underline" href={`/routines/${entry.routine.slug}`}>
                            {entry.routine.name}
                          </Link>
                          {entry.notes && <p className="mt-3 text-sm text-muted-foreground">{entry.notes}</p>}
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
