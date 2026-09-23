import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { fetchWorkoutSession } from "@/lib/workout-sessions-server";
import { WorkoutSessionOverviewController } from "./components/workout-session-overview-controller";
import { WorkoutSessionSummary } from "./components/workout-session-summary";
import { isRateLimitedResult } from "@/lib/api/error";
import { RateLimitedState } from "@/components/rate-limited-state";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workoutSessionId: string }>;
}): Promise<Metadata> {
  const { workoutSessionId } = await params;
  const session = await fetchWorkoutSession(workoutSessionId);
  return {
    title: session
      ? `${!isRateLimitedResult(session) ? (session.sourceRoutineNameSnapshot ?? "Workout") : "Workout"} Workout`
      : "Workout Session Not Found",
  };
}

export default async function WorkoutSessionDetailsPage({
  params,
}: {
  params: Promise<{ workoutSessionId: string }>;
}) {
  const { workoutSessionId } = await params;
  const session = await fetchWorkoutSession(workoutSessionId);
  if (isRateLimitedResult(session))
    return (
      <RateLimitedState
        title="Workout session is temporarily unavailable"
        description="Too many requests were made. Please wait a moment and try again."
      />
    );
  if (!session) notFound();

  const isInProgress = session.status === "IN_PROGRESS";
  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-hidden px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader
        subtitle={
          isInProgress
            ? "Keep your workout moving."
            : "Review your workout history."
        }
      >
        <Link
          href="/workout-sessions"
          className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Workout sessions
        </Link>
        <ChevronRight
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="max-w-48 truncate text-lg leading-none font-bold">
          {session.sourceRoutineNameSnapshot ?? "Workout"}
        </h1>
      </PageHeader>
      <section className="min-h-0 flex-1 md:p-1 overflow-y-auto rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
        {isInProgress ? (
          <WorkoutSessionOverviewController session={session} />
        ) : (
          <WorkoutSessionSummary session={session} />
        )}
      </section>
    </main>
  );
}
