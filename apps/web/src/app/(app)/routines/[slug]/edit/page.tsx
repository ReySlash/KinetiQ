import { notFound } from "next/navigation";

import { fetchRoutine } from "@/lib/routines-server";
import { RoutineBuilder } from "../../components/routine-builder";

export const dynamic = "force-dynamic";

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
  if (!routine || routine.visibility !== "PRIVATE") notFound();

  const initialExerciseSlug = typeof query.exerciseSlug === "string" ? query.exerciseSlug : undefined;
  return <RoutineBuilder routine={routine} initialExerciseSlug={initialExerciseSlug} />;
}
