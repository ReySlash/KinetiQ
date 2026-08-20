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
      <PageHeader subtitle="Explore each muscle group&apos;s function and anatomy.">
        <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-auto rounded-xl border border-border/70 bg-card/80 p-2 shadow-sm md:rounded-3xl md:p-3">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Muscle Group Name</TableHead>
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
            <Card key={index} className="w-full px-4 py-1">
              <CardContent className="flex items-center justify-between gap-2">
                <Skeleton className="size-[70px] shrink-0 rounded-xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="size-9 shrink-0 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
