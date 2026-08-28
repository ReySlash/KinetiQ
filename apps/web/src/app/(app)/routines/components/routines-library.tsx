import Link from "next/link";
import { Dumbbell, MoreHorizontal, Plus } from "lucide-react";

import StyledLink from "@/components/styled-link";
import ImageWithFallback from "@/components/image-with-fallback";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Routine</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Exercises</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routines.map((routine) => (
                    <TableRow key={routine.slug}>
                      <TableCell>
                        <ImageWithFallback
                          className="rounded-xl border"
                          src="/empty-state-exercises.webp"
                          alt="Routine cover"
                          width={70}
                          height={70}
                          fallbackSrc="/empty-state-exercises.webp"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{routine.name}</TableCell>
                      <TableCell>{routine.exerciseCount}</TableCell>
                      <TableCell>{formatDate(routine.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Link
                                  href={`/routines/${routine.slug}`}
                                  className="inline-flex size-10 items-center justify-center rounded-md border border-border transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                                  aria-label={`Open ${routine.name}`}
                                  title="Open routine details"
                                >
                                  <MoreHorizontal className="size-5" />
                                </Link>
                              }
                            />
                            <TooltipContent>Open routine details</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-2 md:hidden">
              {routines.map((routine) => (
                <Card key={routine.slug} className="w-full py-1">
                  <CardContent className="flex flex-row items-center justify-between gap-2 px-1">
                    <ImageWithFallback
                      className="rounded-xl"
                      src="/empty-state-exercises.webp"
                      alt="Routine cover"
                      width={70}
                      height={70}
                      fallbackSrc="/empty-state-exercises.webp"
                    />
                    <div className="min-w-0 flex-1 text-center">
                      <CardTitle className="truncate">{routine.name}</CardTitle>
                      <CardDescription>
                        {routine.exerciseCount}{" "}
                        {routine.exerciseCount === 1 ? "exercise" : "exercises"}
                      </CardDescription>
                    </div>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Link
                            href={`/routines/${routine.slug}`}
                            className="inline-flex size-10 items-center justify-center rounded-md border border-border transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            aria-label={`Open ${routine.name}`}
                            title="Open routine details"
                          >
                            <MoreHorizontal className="size-5" />
                          </Link>
                        }
                      />
                      <TooltipContent>Open routine details</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
