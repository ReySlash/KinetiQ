import StyledLink from "@/components/styled-link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExerciseMuscleSummary } from "@/types/exercise-types";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ExercisesMusclesCardProps = {
  exercises: ExerciseMuscleSummary[];
};

export default function ExercisesMusclesCard(props: ExercisesMusclesCardProps) {
  const { exercises } = props;
  return (
    <Card className="col-span-1 w-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.slug}>
                <TableCell>
                  <Image
                    className="rounded-xl"
                    src={
                      exercise.thumbnailUrl ??
                      "/empty-state-exercises.webp"
                    }
                    alt={
                      exercise.imageAltText ?? "Not image description found."
                    }
                    width={70}
                    height={70}
                  />
                </TableCell>
                <TableCell>{exercise.name}</TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <StyledLink
                          href={`/exercises/${exercise.slug}`}
                          variant="outline"
                          aria-label="Open exercise details"
                        >
                          <MoreHorizontal />
                        </StyledLink>
                      }
                    />
                    <TooltipContent>Open exercise details</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
