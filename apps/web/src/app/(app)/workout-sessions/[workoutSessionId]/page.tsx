import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { fetchWorkoutSession } from "@/lib/workout-sessions-server";
import { ActiveWorkoutController } from "./components/active-workout-controller";
import { WorkoutSessionSummary } from "./components/workout-session-summary";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ workoutSessionId: string }> }): Promise<Metadata> {
  const { workoutSessionId } = await params;
  const session = await fetchWorkoutSession(workoutSessionId);
  return { title: session ? `${session.sourceRoutineNameSnapshot ?? "Workout"} | KinetiQ` : "Workout session not found | KinetiQ" };
}

export default async function WorkoutSessionDetailsPage({ params }: { params: Promise<{ workoutSessionId: string }> }) {
  const { workoutSessionId } = await params;
  const session = await fetchWorkoutSession(workoutSessionId);
  if (!session) notFound();

  const isInProgress = session.status === "IN_PROGRESS";
  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-hidden px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle={isInProgress ? "Keep your workout moving." : "Review your workout history."}>
        <Link href="/workout-sessions" className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
          <ChevronLeft className="size-4" aria-hidden="true" /> Workout sessions
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
        <h1 className="max-w-48 truncate text-lg leading-none font-bold">{session.sourceRoutineNameSnapshot ?? "Workout"}</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto rounded-lg md:rounded-2xl">
        {isInProgress ? <ActiveWorkoutController session={session} /> : <WorkoutSessionSummary session={session} />}
      </section>
    </main>
  );
}
