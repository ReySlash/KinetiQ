import { Dumbbell, MoreHorizontal, Plus } from "lucide-react";

import StyledLink from "@/components/styled-link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RoutineListItem } from "@/types/routine-types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { RoutinesFilters } from "./routines-filters";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function RoutinesLibrary({
  routines,
  scope,
}: {
  routines: RoutineListItem[];
  scope: "my" | "global";
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
      <div className="flex flex-col gap-1 border-b border-border/70 bg-background/30 p-1 md:flex-row md:items-center md:justify-between md:p-2">
        <div className="w-full md:order-2 md:ml-auto md:w-[min(100%,38rem)]">
          <RoutinesFilters />
        </div>
        {scope === "my" ? (
          <div className="flex justify-center gap-2 md:order-1 md:w-auto md:justify-start">
            <StyledLink href="/routines/new" size="lg" className="w-full md:w-auto">
              <Plus data-icon="inline-start" />
              New routine
            </StyledLink>
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
        {routines.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Dumbbell className="size-6" />
              </div>
              <div>
                <p className="font-medium">
                  {scope === "global" ? "No global routines found" : "No routines yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scope === "global"
                    ? "Try adjusting your search or filters."
                    : "Create your first routine and start arranging your training."}
                </p>
              </div>
              {scope === "my" && (
                <StyledLink href="/routines/new" variant="outline">
                  <Plus />
                  Create routine
                </StyledLink>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {routines.map((routine) => (
              <Card
                key={routine.slug}
                className="transition-colors hover:border-primary/50"
              >
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardAction>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <StyledLink
                            href={`/routines/${routine.slug}`}
                            variant="outline"
                            aria-label="Open routine details"
                          >
                            <MoreHorizontal />
                          </StyledLink>
                        }
                      />
                      <TooltipContent>Open routine details</TooltipContent>
                    </Tooltip>
                  </CardAction>
                  <CardDescription className="line-clamp-2 min-h-10">
                    {routine.description || "No description yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {routine.exerciseCount}{" "}
                    {routine.exerciseCount === 1 ? "exercise" : "exercises"}
                  </span>
                  <span>Updated {formatDate(routine.updatedAt)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
