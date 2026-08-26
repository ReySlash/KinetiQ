import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { fetchRoutines } from "@/lib/routines-server";
import { fetchWorkoutSessions } from "@/lib/workout-sessions-server";
import { WorkoutSessionsLibrary } from "./components/workout-sessions-library";
import type { WorkoutSessionStatus } from "@/types/workout-session-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workout sessions | KinetiQ",
  description: "Start, resume, and review your workouts.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

function parseDate(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseStatus(value: string | string[] | undefined): WorkoutSessionStatus | undefined {
  return value === "IN_PROGRESS" || value === "COMPLETED" || value === "CANCELLED"
    ? value
    : undefined;
}

export default async function WorkoutSessionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await fetchWorkoutSessions({
    q: typeof params.q === "string" ? params.q.trim() || undefined : undefined,
    status: parseStatus(params.status),
    from: parseDate(params.from),
    to: parseDate(params.to),
  });
  const routinesResult =
    result.status === "authenticated"
      ? await fetchRoutines({ scope: "my" })
      : { status: "unauthenticated" as const };

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Start, resume, and review your workouts.">
        <h1 className="text-lg leading-none font-bold">Workout sessions</h1>
      </PageHeader>
      {result.status === "unauthenticated" ? (
        <Card className="flex min-h-0 flex-1 items-center justify-center border border-border/70 bg-card/80 shadow-sm">
          <CardContent className="flex max-w-md flex-col items-center gap-3 p-8 text-center">
            <CardTitle>Sign in to view your workouts</CardTitle>
            <CardDescription>
              Your workout history is private and belongs to your account.
            </CardDescription>
            <StyledLink href="/sign-in?callbackURL=%2Fworkout-sessions" size="lg">
              Sign in
            </StyledLink>
          </CardContent>
        </Card>
      ) : (
        <WorkoutSessionsLibrary
          sessions={result.sessions}
          routines={routinesResult.status === "authenticated" ? routinesResult.routines : []}
        />
      )}
    </main>
  );
}
