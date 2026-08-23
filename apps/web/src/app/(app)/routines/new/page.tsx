import { RoutineBuilder } from "../components/routine-builder";

export const metadata = {
  title: "New routine | KinetiQ",
  description: "Create a reusable workout routine.",
  robots: { index: false, follow: false },
};

export default async function NewRoutinePage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseSlug?: string | string[] }>;
}) {
  const query = await searchParams;
  const initialExerciseSlug = typeof query.exerciseSlug === "string" ? query.exerciseSlug : undefined;
  return <RoutineBuilder initialExerciseSlug={initialExerciseSlug} />;
}
