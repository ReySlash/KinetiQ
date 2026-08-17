import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrainingProgram } from "@/lib/training-programs-server";

export const dynamic = "force-dynamic";

export default async function EditTrainingProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await fetchTrainingProgram(slug);
  if (!program || program.visibility !== "PRIVATE") notFound();

  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Edit a reusable multi-week training template.">
        <Link className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground" href="/training-programs">Training Programs</Link>
        <span className="text-lg leading-none text-muted-foreground">{" > "}</span>
        <Link className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground" href={`/training-programs/${program.slug}`}>{program.name}</Link>
        <span className="text-lg leading-none text-muted-foreground">{" > "}</span>
        <h1 className="text-lg font-bold leading-none">Edit</h1>
      </PageHeader>
      <section className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader><CardTitle>Training program editor coming soon</CardTitle><CardDescription>The editor will let you update the program details and arrange its routines.</CardDescription></CardHeader>
          <CardContent><StyledLink href={`/training-programs/${program.slug}`} variant="outline">Back to program</StyledLink></CardContent>
        </Card>
      </section>
    </main>
  );
}
