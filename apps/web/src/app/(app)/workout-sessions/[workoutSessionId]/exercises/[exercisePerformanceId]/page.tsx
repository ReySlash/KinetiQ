import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { RateLimitedState } from "@/components/rate-limited-state";
import { isRateLimitedResult } from "@/lib/api/error";
import { fetchWorkoutSession } from "@/lib/workout-sessions-server";
import { ActiveWorkoutController } from "../../components/active-workout-controller";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workoutSessionId: string; exercisePerformanceId: string }>;
}): Promise<Metadata> {
  const { workoutSessionId, exercisePerformanceId } = await params;
  const session = await fetchWorkoutSession(workoutSessionId);
  const performance = !isRateLimitedResult(session)
    ? session?.performances.find((item) => item.id === exercisePerformanceId)
    : null;
  return {
    title: performance
      ? `${performance.exerciseNameSnapshot} Workout`
      : "Exercise Workout",
  };
}

export default async function WorkoutExercisePage({
  params,
}: {
  params: Promise<{ workoutSessionId: string; exercisePerformanceId: string }>;
}) {
  const { workoutSessionId, exercisePerformanceId } = await params;
  const session = await fetchWorkoutSession(workoutSessionId);
  if (isRateLimitedResult(session)) {
    return (
      <RateLimitedState
        title="Workout exercise is temporarily unavailable"
        description="Too many requests were made. Please wait a moment and try again."
      />
    );
  }
  if (!session || session.status !== "IN_PROGRESS") notFound();
  const performance = session.performances.find(
    (item) => item.id === exercisePerformanceId,
  );
  if (!performance) notFound();

  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-hidden px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="Record each set and keep your rest on track.">
        <Link
          href={`/workout-sessions/${session.id}`}
          className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Workout
        </Link>
        <ChevronRight
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="max-w-56 truncate text-lg leading-none font-bold">
          {performance.exerciseNameSnapshot}
        </h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-hidden rounded-lg md:rounded-2xl">
        <ActiveWorkoutController
          session={session}
          exercisePerformanceId={exercisePerformanceId}
        />
      </section>
    </main>
  );
}
