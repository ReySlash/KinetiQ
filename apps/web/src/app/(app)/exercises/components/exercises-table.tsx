import StyledLink from "@/components/styled-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Exercise } from "@/types/exercise-types";
import Image from "next/image";
import { CiMenuBurger } from "react-icons/ci";
import { AddToRoutineDialog } from "@/components/add-to-routine-dialog";

type ExercisesTableProps = {
  exercises: Exercise[];
};

export function ExercisesTable(props: ExercisesTableProps) {
  const { exercises } = props;

  return (
    <>
      <div className="hidden md:block">
        {/* Desktop Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Muscles Involved</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.length !== 0 ? (
              exercises.map((exercise) => (
                <TableRow key={exercise.slug}>
                  <TableCell className="font-medium">
                    <Image
                      className="border rounded-xl"
                      src={
                        exercise.thumbnailUrl ??
                        "https://avatar.vercel.sh/shadcn1"
                      }
                      alt={
                        exercise.imageAltText ?? "Image description not found"
                      }
                      width={70}
                      height={70}
                    />
                  </TableCell>
                  <TableCell>{exercise.name}</TableCell>
                  <TableCell>{exercise.muscles.length}</TableCell>
                  <TableCell>
                    <div className="min-h-full flex justify-end gap-2">
                      <AddToRoutineDialog
                        exerciseSlug={exercise.slug}
                        exerciseName={exercise.name}
                        triggerVariant="outline"
                      />
                      <StyledLink
                        href={`/exercises/${exercise.slug}`}
                        variant={"outline"}
                      >
                        <CiMenuBurger />
                      </StyledLink>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No exercises found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {/* Mobile Table */}
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <Card
              key={exercise.slug}
              className="flex flex-col justify-center w-full py-1"
            >
              <CardContent className="flex flex-row items-center justify-between px-1">
                <Image
                  className="col-span-1 rounded-xl"
                  src={
                    exercise.thumbnailUrl ?? "https://avatar.vercel.sh/shadcn"
                  }
                  alt={exercise.imageAltText ?? "Event cover"}
                  width={70}
                  height={70}
                />

                <div className="text-wrap text-center">
                  <CardTitle>{exercise.name}</CardTitle>
                  <CardDescription>
                    {exercise.muscles.length} muscles involved
                  </CardDescription>
                </div>

                <div className="flex gap-1">
                  <AddToRoutineDialog
                    exerciseSlug={exercise.slug}
                    exerciseName={exercise.name}
                    triggerVariant="outline"
                  />
                  <StyledLink
                    href={`/exercises/${exercise.slug}`}
                    variant={"outline"}
                  >
                    <CiMenuBurger />
                  </StyledLink>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">No exercises found</div>
        )}
      </div>
    </>
  );
}
