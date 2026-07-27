import { Card, CardContent } from "@/components/ui/card";
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

            <section className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3  col-span-1">
                <p>Exercise</p>
                <p>Force Type</p>
                <p>Movement Pattern</p>
                <p>Muscles Involved</p>
                <p>Kinetic chain</p>
                <p>Is compound</p>
                <p>Laterality</p>
                <p>Contraction Mode</p>
                <p>Body Position</p>
                <p>Skill Level</p>
              </div>
              <div className="flex flex-col gap-3 col-span-1 text-muted-foreground">
                <p>- {exerciseDetails.name}</p>
                <p>- {exerciseDetails.forceType.toLowerCase()}</p>
                <p>- {exerciseDetails.movementPattern?.name ?? "N/A"}</p>
                <p>- {exerciseDetails.muscles?.length ?? "N/A"}</p>
                <p>- {exerciseDetails.kineticChain.toLowerCase() ?? "N/A"}</p>
                <p>- {exerciseDetails.isCompound ? "Yes" : "No"}</p>
                <p>- {exerciseDetails.laterality.toLowerCase()}</p>
                <p>- {exerciseDetails.contractionMode.toLowerCase()}</p>
                <p>- {exerciseDetails.bodyPosition.toLocaleLowerCase()}</p>
                <p>- {exerciseDetails.skillLevel.toLocaleLowerCase()}</p>
              </div>
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
