import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseDetails } from "@/types/exercise-types";

export default function OverviewCard({
  exerciseDetails,
}: {
  exerciseDetails: ExerciseDetails;
}) {
  return (
    <Card className="col-span-1 p-2">
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="Instructions">Instructions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex flex-col gap-3">
            <section className="border-b flex flex-col gap-3">
              <article>
                <h3 className="font-bold text-lg">{exerciseDetails.name}</h3>
                <p className="text-muted-foreground">
                  {exerciseDetails.description}
                </p>
              </article>
              <article>
                <p className="font-semibold">
                  {exerciseDetails.movementPattern?.name
                    ? "- " +
                      exerciseDetails.movementPattern.name +
                      " (Movement Pattern)"
                    : ""}
                </p>
                <p className="text-muted-foreground">
                  {exerciseDetails.movementPattern?.description ?? ""}
                </p>
              </article>
            </section>

            <section>
              <Table className="table-fixed">
                <colgroup>
                  <col className="w-1/2" />
                  <col className="w-1/2" />
                </colgroup>
                <TableBody>
                  <TableRow>
                    <TableCell>Exercise</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.name}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Force Type</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.forceType.toLocaleLowerCase()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Movement Pattern</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.movementPattern?.name ?? "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Muscles Involved</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.muscles?.length ?? "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Kinetic chain</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.kineticChain.toLowerCase() ?? "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Is compound</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.isCompound ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Laterality</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.laterality.toLowerCase()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contraction Mode</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.contractionMode.toLowerCase()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Body Position</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      -{exerciseDetails.bodyPosition.toLocaleLowerCase()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Skill Level</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      - {exerciseDetails.skillLevel.toLocaleLowerCase()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>
          </TabsContent>
          <TabsContent value="Instructions" className="space-y-3">
            <section className="border-b">
              <h3 className="text-lg font-bold">Instructions</h3>
              <p className="text-muted-foreground">
                {exerciseDetails.instructions ?? "N/A"}
              </p>
            </section>
            <section className="border-b">
              <h3 className="text-lg font-bold">Common Mistakes</h3>
              <p className="text-muted-foreground">
                {exerciseDetails.commonMistakes ?? "N/A"}
              </p>
            </section>
            <section>
              <h3 className="font-bold text-lg">Equipment</h3>
              {exerciseDetails.equipment.length > 0 &&
                exerciseDetails.equipment.map((e) => (
                  <article key={e.slug} className="pb-2">
                    <p className="font-semibold">- {e.name}:</p>
                    <p className="text-muted-foreground">{e.description}</p>
                  </article>
                ))}
            </section>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
