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
import { MuscleGroup } from "@/types/muscle-types";
import Image from "next/image";
import { CiMenuBurger } from "react-icons/ci";

type MuscleGroupsTableProps = {
  muscleGroups: MuscleGroup[];
};

export function MuscleGroupsTable(props: MuscleGroupsTableProps) {
  const { muscleGroups } = props;

  function getBodyRegion(muscleGroup: MuscleGroup) {
    try {
      const bodyRegion = Object.entries(
        muscleGroup.muscles.reduce(
          (acc, curr) => {
            acc[curr.bodyRegion] = (acc[curr.bodyRegion] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      )
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0]
        .replace("_", " ")
        .toLowerCase();
      return bodyRegion;
    } catch (error) {
      console.error(error);
      return "N/A";
    }
  }

  return (
    <>
      <div className="hidden md:block">
        {/* Desktop Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Muscle Group</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Body Region</TableHead>
              <TableHead>Muscles</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {muscleGroups.length !== 0 ? (
              muscleGroups.map((muscleGroup) => (
                <TableRow key={muscleGroup.slug}>
                  <TableCell className="font-medium">
                    <Image
                      className="border rounded-xl"
                      src={
                        muscleGroup.thumbnailUrl ??
                        "https://avatar.vercel.sh/shadcn1"
                      }
                      alt={
                        muscleGroup.imageAltText ??
                        "Image description not found"
                      }
                      width={70}
                      height={70}
                    />
                  </TableCell>
                  <TableCell>{muscleGroup.name}</TableCell>
                  <TableCell>{getBodyRegion(muscleGroup)}</TableCell>
                  <TableCell>{muscleGroup.muscles.length}</TableCell>
                  <TableCell className="text-right">
                    <StyledLink
                      href={`/muscle-groups/${muscleGroup.slug}`}
                      variant="outline"
                    >
                      <CiMenuBurger />
                    </StyledLink>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No muscle groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {/* Mobile Table */}
        {muscleGroups.length !== 0 ? (
          muscleGroups.map((muscleGroup) => (
            <Card
              key={muscleGroup.slug}
              className="flex flex-col justify-center w-full px-4 py-1"
            >
              <CardContent className="flex flex-row items-center justify-between">
                <Image
                  className="col-span-1 rounded-xl"
                  src={
                    muscleGroup.thumbnailUrl ??
                    "https://avatar.vercel.sh/shadcn"
                  }
                  alt={muscleGroup.imageAltText ?? "Event cover"}
                  width={70}
                  height={70}
                />

                <div>
                  <CardTitle>{muscleGroup.name}</CardTitle>
                  <CardDescription>
                    {getBodyRegion(muscleGroup)}
                  </CardDescription>
                  <CardDescription>
                    {muscleGroup.muscles.length} muscles
                  </CardDescription>
                </div>
                <StyledLink
                  href={`/muscle-groups/${muscleGroup.slug}`}
                  variant="outline"
                >
                  <CiMenuBurger />
                </StyledLink>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">No muscle groups found</div>
        )}
      </div>
    </>
  );
}
