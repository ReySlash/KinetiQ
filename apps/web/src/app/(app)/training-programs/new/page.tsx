import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { fetchRoutines } from "@/lib/routines-server";
import { TrainingProgramBuilder } from "./training-program-builder";

export const dynamic = "force-dynamic";

export default async function NewTrainingProgramPage() {
  const [globalResult, privateResult] = await Promise.all([
    fetchRoutines({ scope: "global" }),
    fetchRoutines({ scope: "my" }),
  ]);

  if (privateResult.status === "unauthenticated") {
    return (
      <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
        <PageHeader subtitle="Create a reusable multi-week training template."><h1 className="text-lg font-bold leading-none">New Training Program</h1></PageHeader>
        <Card className="flex min-h-0 flex-1 items-center justify-center border border-border/70 bg-card/80 shadow-sm"><CardContent className="flex max-w-md flex-col items-center gap-3 p-8 text-center"><CardTitle>Sign in to create a training program</CardTitle><CardDescription>Training programs are private templates saved to your account.</CardDescription><StyledLink href={`/sign-in?callbackURL=${encodeURIComponent("/training-programs/new")}`} size="lg">Sign in</StyledLink></CardContent></Card>
      </main>
    );
  }

  const globalRoutines = globalResult.status === "authenticated" ? globalResult.routines : [];
  const routines = [...globalRoutines, ...privateResult.routines].filter(
    (routine, index, all) =>
      all.findIndex((candidate) => candidate.slug === routine.slug) === index,
  );
  return <TrainingProgramBuilder routines={routines} />;
}
