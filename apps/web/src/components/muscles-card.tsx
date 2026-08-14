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
import ImageWithFallback from "@/components/image-with-fallback";
import { MoreHorizontal } from "lucide-react";
import { getLocalImageSrc } from "@/lib/local-image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MuscleSCardProps = {
  muscles: ExerciseMuscleSummary[];
};

export default function MuscleSCard(props: MuscleSCardProps) {
  const { muscles } = props;
  return (
    <Card className="w-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Muscle</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {muscles.map((m) => (
              <TableRow key={m.slug}>
                <TableCell>
                  <ImageWithFallback
                    className="rounded-xl"
                    src={
                      m.thumbnailUrl ??
                      getLocalImageSrc("muscles", m.slug)
                    }
                    alt={m.imageAltText ?? "Not image description found."}
                    width={70}
                    height={70}
                    fallbackSrc="/empty-state-muscles.webp"
                  />
                </TableCell>
                <TableCell className="text-wrap whitespace-normal">
                  {m.name}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <StyledLink
                          href={`/muscles/${m.slug}`}
                          variant="outline"
                          aria-label="Open muscle details"
                        >
                          <MoreHorizontal />
                        </StyledLink>
                      }
                    />
                    <TooltipContent>Open muscle details</TooltipContent>
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
