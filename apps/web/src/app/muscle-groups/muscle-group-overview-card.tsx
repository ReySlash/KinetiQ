import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MuscleGroupDetails } from "@/types/muscle-types";

export default function MuscleGroupOverviewCard({
  muscleGroupDetails,
}: {
  muscleGroupDetails: MuscleGroupDetails;
}) {
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
        <Table className="table-fixed">
          <colgroup>
            <col className="w-2/3"></col>
            <col className="w-1/3 "></col>
          </colgroup>
          <TableBody>
            <TableRow>
              <TableCell>Group</TableCell>
              <TableCell className="text-muted-foreground">
                - {muscleGroupDetails.name}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Body Region</TableCell>
              <TableCell className="text-muted-foreground">
                -{" "}
                {muscleGroupDetails.bodyRegion.replace("_", " ").toLowerCase()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Number of muscles</TableCell>
              <TableCell className="text-muted-foreground">
                - {muscleGroupDetails.muscles.length}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
