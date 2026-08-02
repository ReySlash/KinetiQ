import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MuscleGroupDetails } from "@/types/muscle-types";
import OverviewTable from "@/components/overview-table";

export default function MuscleGroupOverviewCard({
  muscleGroupDetails,
}: {
  muscleGroupDetails: MuscleGroupDetails;
}) {
  const headers = ["Group", "Body Region", "Number of muscles"];
  const values = [
    muscleGroupDetails.name,
    muscleGroupDetails.bodyRegion.replace("_", " ").toLowerCase(),
    muscleGroupDetails.muscles.length,
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
          {muscleGroupDetails.description ?? "No description available."}
        </CardDescription>
        <OverviewTable headers={headers} values={values} />
      </CardContent>
    </Card>
  );
}
