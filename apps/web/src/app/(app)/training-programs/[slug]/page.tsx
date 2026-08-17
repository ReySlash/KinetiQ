import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrainingProgram } from "@/lib/training-programs-server";

export const dynamic = "force-dynamic";

export default async function TrainingProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await fetchTrainingProgram(slug);
  if (!program) notFound();

  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Training program overview.">
        <Link
          className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground"
          href="/training-programs"
        >
          Training Programs
        </Link>
        <span className="text-lg leading-none text-muted-foreground">{" > "}</span>
        <h1 className="text-lg font-bold leading-none">{program.name}</h1>
      </PageHeader>
      <section className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader><CardTitle>Program overview</CardTitle><CardDescription>{program.description || "No description yet."}</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/30 p-4"><p className="text-xs text-muted-foreground">Duration</p><p className="mt-1 font-medium">{program.durationWeeks} {program.durationWeeks === 1 ? "week" : "weeks"}</p></div>
              <div className="rounded-xl border border-border/70 bg-background/30 p-4"><p className="text-xs text-muted-foreground">Visibility</p><p className="mt-1 font-medium">{program.visibility === "GLOBAL" ? "Global" : "Private"}</p></div>
            </div>
            <p className="text-sm text-muted-foreground">The training program builder and schedule editor will be available here soon.</p>
            <StyledLink href="/training-programs" variant="outline">Back to training programs</StyledLink>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
