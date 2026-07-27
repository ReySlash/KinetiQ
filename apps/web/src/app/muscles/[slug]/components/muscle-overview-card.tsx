import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Muscle Name</TableCell>
              <TableCell className="text-muted-foreground">
                - {muscleDetails.name}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Muscle Group</TableCell>
              <TableCell className="text-muted-foreground">
                - {muscleDetails.muscleGroup?.name ?? "N/A"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Body Region</TableCell>
              <TableCell className="text-muted-foreground">
                - {muscleDetails.bodyRegion.replace("_", " ").toLowerCase()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Primary Function</TableCell>
              <TableCell className="text-muted-foreground">
                <p>- {primaryFunctions ?? "N/A"}</p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Secondary Functions</TableCell>
              <TableCell className="text-muted-foreground flex flex-col gap-1">
                {secondaryFunctions.length > 0
                  ? secondaryFunctions.map((func, id) => (
                      <p key={id}>- {func}</p>
                    ))
                  : "- N/A"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
