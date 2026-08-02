import OverviewTable from "@/components/overview-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Muscle } from "@/types/muscle-types";

export default function MuscleOverviewCard({
  muscleDetails,
}: {
  muscleDetails: Muscle;
}) {
  const primaryFunctions: string | undefined =
    muscleDetails.functionAssignments.find((fa) => fa.role === "PRIMARY")
      ?.muscleFunction.name;

  const secondaryFunctions: string[] = muscleDetails.functionAssignments
    .filter((fa) => fa.role === "SECONDARY")
    .map((fa) => fa.muscleFunction.name);

  const headers = [
    "Muscle Name",
    "Muscle Group",
    "Body Region",
    "Primary Function",
    "Secondary Functions",
  ];
  const values = [
    muscleDetails.name,
    muscleDetails.muscleGroup?.name ?? "N/A",
    muscleDetails.bodyRegion.replace("_", " ").toLowerCase(),
    primaryFunctions ?? "N/A",
    secondaryFunctions.join(", ") || "N/A",
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-bold leading-none mb-1">
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="col-span-2">
          {muscleDetails.description ?? "No description available."}
        </CardDescription>

        <OverviewTable headers={headers} values={values} />
      </CardContent>
    </Card>
  );
}
