import { SidebarTrigger } from "@/components/ui/sidebar";
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
    <>
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60 px-4">
        <SidebarTrigger />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
          <h2 className="text-xs text-muted-foreground">
            Explore our exercise&apos;s catalog.
          </h2>
        </div>
      </header>
      <main className="h-full w-full p-2 md:p-3">
        <section className="rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3 h-full">
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
        </section>
      </main>
    </>
  );
}
