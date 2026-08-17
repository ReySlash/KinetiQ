import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewTrainingProgramPage() {
  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Create a reusable multi-week training template.">
        <Link
          className="text-lg leading-none font-bold transition-colors duration-200 not-hover:text-muted-foreground"
          href="/training-programs"
        >
          Training Programs
        </Link>
        <span className="text-lg leading-none text-muted-foreground">{" > "}</span>
        <h1 className="text-lg font-bold leading-none">New Training Program</h1>
      </PageHeader>
      <section className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader><CardTitle>Training program builder coming soon</CardTitle><CardDescription>The builder will let you organize routines into a multi-week training plan.</CardDescription></CardHeader>
          <CardContent><StyledLink href="/training-programs" variant="outline">Back to training programs</StyledLink></CardContent>
        </Card>
      </section>
    </main>
  );
}
