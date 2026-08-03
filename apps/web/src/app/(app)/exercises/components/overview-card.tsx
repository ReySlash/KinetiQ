import OverviewTable from "@/components/overview-table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseDetails } from "@/types/exercise-types";
import type { ReactNode } from "react";

export default function OverviewCard({
  exerciseDetails,
  actions,
}: {
  exerciseDetails: ExerciseDetails;
  actions?: ReactNode;
}) {
  const headers = [
    "Exercise",
    "Force Type",
    "Movement Pattern",
    "Muscles Involved",
    "Kinetic chain",
    "Is compound",
    "Laterality",
    "Contraction Mode",
    "Body Position",
    "Skill Level",
  ];
  const values = [
    exerciseDetails.name,
    exerciseDetails.forceType.toLocaleLowerCase(),
    exerciseDetails.movementPattern?.name ?? "N/A",
    exerciseDetails.muscles?.length ?? "N/A",
    exerciseDetails.kineticChain.toLowerCase() ?? "N/A",
    exerciseDetails.isCompound ? "Yes" : "No",
    exerciseDetails.laterality.toLowerCase(),
    exerciseDetails.contractionMode.toLowerCase(),
    exerciseDetails.bodyPosition.toLocaleLowerCase(),
    exerciseDetails.skillLevel.toLocaleLowerCase(),
  ];
  return (
    <Card className="p-2">
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
              <OverviewTable headers={headers} values={values} />
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
        {actions ? (
          <div className="mt-4 flex justify-center border-t border-border/70 pt-4 sm:justify-end">
            {actions}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
