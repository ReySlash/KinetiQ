import { notFound } from "next/navigation";

import { fetchRoutine } from "@/lib/routines-server";
import { RoutineBuilder } from "../../components/routine-builder";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function EditRoutinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const routine = await fetchRoutine(id);
  if (!routine) notFound();

  const initialExerciseSlug = typeof query.exerciseSlug === "string" ? query.exerciseSlug : undefined;
  return <RoutineBuilder routine={routine} initialExerciseSlug={initialExerciseSlug} />;
}
