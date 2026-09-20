import { notFound } from "next/navigation";

import { fetchRoutines } from "@/lib/routines-server";
import { fetchTrainingProgram } from "@/lib/training-programs-server";
import { TrainingProgramBuilder } from "../../new/training-program-builder";
import { isRateLimitedResult } from "@/lib/api/error";
import { RateLimitedState } from "@/components/rate-limited-state";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Training Program",
  robots: { index: false, follow: false },
};

export default async function EditTrainingProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [program, privateRoutines, globalRoutines] = await Promise.all([
    fetchTrainingProgram(slug),
    fetchRoutines({ scope: "my" }),
    fetchRoutines({ scope: "global" }),
  ]);
  if (isRateLimitedResult(program) || privateRoutines.status === "rate-limited" || globalRoutines.status === "rate-limited") {
    return <RateLimitedState title="Training program editor is temporarily unavailable" description="Too many requests were made. Please wait a moment and try again." />;
  }
  if (!program || program.visibility !== "PRIVATE") notFound();

  const routines = [
    ...(globalRoutines.status === "authenticated" ? globalRoutines.routines : []),
    ...(privateRoutines.status === "authenticated" ? privateRoutines.routines : []),
  ].filter(
    (routine, index, all) =>
      all.findIndex((candidate) => candidate.slug === routine.slug) === index,
  );

  return <TrainingProgramBuilder routines={routines} program={program} />;
}
