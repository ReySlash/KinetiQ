import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MuscleSkeletonCard() {
  return (
    <>
      {[...Array(20).keys()].map((index) => (
        <Card
          key={index}
          className="relative mx-auto min-w-full max-w-50 pt-0 max-h-100"
        >
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="h-auto">
            <CardAction>
              <Badge variant="secondary">
                <Skeleton className="h-4 w-2/3" />
              </Badge>
            </CardAction>
            <CardTitle>
              <Skeleton className="h-4 w-2/3" />
            </CardTitle>
          </CardHeader>
          <CardFooter className="py-auto">
            <Button className="w-full sticky bottom-0">Details</Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
