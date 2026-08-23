import { notFound } from "next/navigation";

import { fetchRoutines } from "@/lib/routines-server";
import { fetchTrainingProgram } from "@/lib/training-programs-server";
import { TrainingProgramBuilder } from "../../new/training-program-builder";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditTrainingProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [program, privateRoutines, globalRoutines] = await Promise.all([
    fetchTrainingProgram(slug),
    fetchRoutines({ scope: "my" }),
    fetchRoutines({ scope: "global" }),
  ]);
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
