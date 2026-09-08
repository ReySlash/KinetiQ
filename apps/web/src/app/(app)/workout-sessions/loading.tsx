import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pt-0">
      <PageHeader subtitle="Start, resume, and review your workouts.">
        <h1 className="text-lg leading-none font-bold">Workout sessions</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 space-y-2 overflow-auto rounded-lg border border-border/70 bg-card/80 p-1 shadow-sm md:rounded-2xl md:p-2">
        <Skeleton className="h-12 w-full" />
        <div className="hidden min-h-0 overflow-auto lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workout</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sets</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="size-[70px] rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-9 w-9 rounded-xl" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2 lg:hidden">
          {Array.from({ length: 8 }, (_, index) => (
            <Card key={index} className="w-full py-1">
              <CardContent className="flex items-center justify-between gap-2 px-1">
                <Skeleton className="size-[70px] shrink-0 rounded-xl" />
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex shrink-0 gap-1">
                  <Skeleton className="h-6 w-20 rounded-xl" />
                  <Skeleton className="size-9 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
