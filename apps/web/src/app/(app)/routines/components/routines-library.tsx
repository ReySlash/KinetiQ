import { Dumbbell, Plus } from "lucide-react";
import { CiMenuBurger } from "react-icons/ci";

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

import { RoutinesFilters } from "./routines-filters";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function RoutinesLibrary({ routines }: { routines: RoutineListItem[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm">
      <RoutinesFilters />
      <div className="flex justify-end p-2">
        <StyledLink href="/routines/new" size="lg">
          <Plus />
          New routine
        </StyledLink>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 md:p-5">
        {routines.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Dumbbell className="size-6" />
              </div>
              <div>
                <p className="font-medium">No routines yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first routine and start arranging your training.
                </p>
              </div>
              <StyledLink href="/routines/new" variant="outline">
                <Plus />
                Create routine
              </StyledLink>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {routines.map((routine) => (
              <Card
                key={routine.id}
                className="transition-colors hover:border-primary/50"
              >
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardAction>
                    <StyledLink
                      href={`/routines/${routine.id}`}
                      variant="outline"
                    >
                      <CiMenuBurger />
                      <span className="sr-only">Open routine details</span>
                    </StyledLink>
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
