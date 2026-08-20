import { CalendarRange, MoreHorizontal, Plus } from "lucide-react";

import StyledLink from "@/components/styled-link";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingProgramListItem } from "@/types/training-program-types";
import { TrainingProgramsFilters } from "./training-programs-filters";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export function TrainingProgramsLibrary({ programs, scope }: { programs: TrainingProgramListItem[]; scope: "my" | "global" }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
      <TrainingProgramsFilters />
      {scope === "my" && <div className="flex justify-end p-2"><StyledLink href="/training-programs/new" size="lg"><Plus />New training program</StyledLink></div>}
      <div className="min-h-0 flex-1 overflow-auto p-3 md:p-5">
        {programs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><CalendarRange className="size-6" /></div>
              <div>
                <p className="font-medium">{scope === "global" ? "No global programs found" : "No training programs yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{scope === "global" ? "Try adjusting your search or filters." : "Create your first training program and structure your training over time."}</p>
              </div>
              {scope === "my" && <StyledLink href="/training-programs/new" variant="outline"><Plus />Create your first training program</StyledLink>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.slug} className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{program.name}</CardTitle>
                  <CardAction><StyledLink href={`/training-programs/${program.slug}`} variant="outline" aria-label={`Open ${program.name}`}><MoreHorizontal /></StyledLink></CardAction>
                  <CardDescription className="line-clamp-2 min-h-10">{program.description || "No description yet."}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{program.durationWeeks} {program.durationWeeks === 1 ? "week" : "weeks"}</span>
                  <span>Updated {formatDate(program.updatedAt)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
