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
import { MuscleGroupDetails } from "@/types/muscle-types";
import Image from "next/image";
import { CiMenuBurger } from "react-icons/ci";

export default function MusclesIncludedTable({
  muscleGroupDetails,
}: {
  muscleGroupDetails: MuscleGroupDetails;
}) {
  return (
    <Card className="col-span-1 w-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Muscles Involved</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {muscleGroupDetails.muscles.map((m) => (
              <TableRow key={m.slug}>
                <TableCell>
                  <Image
                    className="rounded-xl"
                    src={m.thumbnailUrl ?? "https://avatar.vercel.sh/shadcn1"}
                    alt={m.imageAltText ?? "Not image description found."}
                    width={70}
                    height={70}
                  />
                </TableCell>
                <TableCell>{m.name}</TableCell>
                <TableCell className="text-right">
                  <StyledLink href={`/muscles/${m.slug}`} variant={"outline"}>
                    <CiMenuBurger />
                  </StyledLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
