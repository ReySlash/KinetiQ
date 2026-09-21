import { notFound } from "next/navigation";

import { fetchRoutine } from "@/lib/routines-server";
import { RoutineBuilder } from "../../components/routine-builder";
import { isRateLimitedResult } from "@/lib/api/error";
import { RateLimitedState } from "@/components/rate-limited-state";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Routine",
  robots: { index: false, follow: false },
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function EditRoutinePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const routine = await fetchRoutine(slug);
  if (isRateLimitedResult(routine)) return <RateLimitedState title="Routine editor is temporarily unavailable" description="Too many requests were made. Please wait a moment and try again." />;
  if (!routine || routine.visibility !== "PRIVATE") notFound();

  const initialExerciseSlug = typeof query.exerciseSlug === "string" ? query.exerciseSlug : undefined;
  return <RoutineBuilder routine={routine} initialExerciseSlug={initialExerciseSlug} />;
}
