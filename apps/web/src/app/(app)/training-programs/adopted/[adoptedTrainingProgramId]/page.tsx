import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchAdoptedTrainingProgram } from "@/lib/adopted-training-programs-server";
import { AdoptedProgramActions } from "./components/adopted-program-actions";
import { AdoptedProgramSchedule } from "./components/adopted-program-schedule";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function statusVariant(
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
) {
  if (status === "ACTIVE") return "default" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
}

function statusClassName(
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
) {
  if (status === "PAUSED") {
    return "border-sky-500/40 bg-sky-500/10 text-sky-300";
  }
  if (status === "COMPLETED") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  }
  return "";
}

export default async function AdoptedTrainingProgramPage({
  params,
}: {
  params: Promise<{ adoptedTrainingProgramId: string }>;
}) {
  const { adoptedTrainingProgramId } = await params;
  const program = await fetchAdoptedTrainingProgram(adoptedTrainingProgramId);
  if (!program) notFound();

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="Follow your program and keep every workout connected.">
        <Link
          href="/training-programs"
          className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          <ChevronLeft aria-hidden="true" />
          Training Programs
        </Link>
        <ChevronRight
          className="shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="text-lg leading-none font-bold">
          {program.programNameSnapshot}
        </h1>
      </PageHeader>

      <section className="min-h-0 flex-1 overflow-y-auto rounded-lg pb-20 md:rounded-2xl md:pb-0">
        <div className="mx-auto flex flex-col gap-2 px-1 md:px-0">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <CardTitle>{program.programNameSnapshot}</CardTitle>
                  <CardDescription>
                    Started {formatDate(program.startedAt)} ·{" "}
                    {program.durationWeeksSnapshot}{" "}
                    {program.durationWeeksSnapshot === 1 ? "week" : "weeks"}
                  </CardDescription>
                </div>
                <Badge
                  variant={statusVariant(program.status)}
                  className={`h-6 min-w-24 justify-center px-2.5 ${statusClassName(program.status)}`}
                >
                  {program.status.toLowerCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">Program progress</span>
                  <span className="text-muted-foreground tabular-nums">
                    {Math.round(program.progressPercent)}%
                  </span>
                </div>
                <Progress
                  value={program.progressPercent}
                  aria-label="Program progress"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold">
                    {program.completedCount}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Skipped</p>
                  <p className="text-xl font-semibold">
                    {program.skippedCount}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Resolved</p>
                  <p className="text-xl font-semibold">
                    {program.resolvedCount}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{program.totalCount}</p>
                </div>
              </div>
              <AdoptedProgramActions program={program} />
            </CardContent>
          </Card>
          <AdoptedProgramSchedule program={program} />
        </div>
      </section>
    </main>
  );
}
