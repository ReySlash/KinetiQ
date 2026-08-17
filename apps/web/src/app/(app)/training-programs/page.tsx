import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { fetchTrainingPrograms } from "@/lib/training-programs-server";
import { TrainingProgramsLibrary } from "./components/training-programs-library";
import { TrainingProgramsTabs } from "./components/training-programs-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Training Programs | KinetiQ",
  description: "Structure your training with reusable multi-week programs.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function TrainingProgramsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const scope = params.scope === "global" ? "global" : "my";
  const result = await fetchTrainingPrograms({ q, sort, scope });

  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Build consistent training across multiple weeks."><h1 className="text-lg font-bold leading-none">Training Programs</h1></PageHeader>
      <TrainingProgramsTabs scope={scope}>
        {result.status === "unauthenticated" ? (
          <Card className="flex min-h-0 flex-1 items-center justify-center border border-border/70 bg-card/80 shadow-sm">
            <CardContent className="flex max-w-md flex-col items-center gap-3 p-8 text-center">
              <CardTitle>Sign in to view your training programs</CardTitle>
              <CardDescription>Training programs are private multi-week templates saved to your account. Sign in to create and manage them.</CardDescription>
              <StyledLink href={`/sign-in?callbackURL=${encodeURIComponent("/training-programs")}`} size="lg">Sign in</StyledLink>
            </CardContent>
          </Card>
        ) : <TrainingProgramsLibrary programs={result.programs} scope={scope} />}
      </TrainingProgramsTabs>
    </main>
  );
}
