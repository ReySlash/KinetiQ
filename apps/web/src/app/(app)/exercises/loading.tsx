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

export default async function Loading() {
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore our exercise&apos;s catalog.">
        <h1 className="text-lg font-bold leading-none">Exercises</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-card/80 p-1 shadow-sm md:rounded-2xl md:p-2">
        <div className="flex gap-2 border-b border-border/70 p-1 md:p-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="hidden min-h-0 overflow-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Exercise Name</TableHead>
                <TableHead>Body Region</TableHead>
                <TableHead>Muscles</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(20).keys()].map((index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="aspect-square h-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2 md:hidden">
          {Array.from({ length: 8 }, (_, index) => (
            <Card key={index} className="w-full py-1">
              <CardContent className="flex items-center justify-between gap-2 px-1">
                <Skeleton className="size-[70px] shrink-0 rounded-xl" />
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex shrink-0 gap-1">
                  <Skeleton className="h-9 w-28 rounded-xl" />
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
