import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";

export function MuscleSkeletonCard() {
  return (
    <>
      {[...Array(20).keys()].map((key, index) => (
        <Card
          key={index}
          className="relative mx-auto min-w-full max-w-sm pt-0 h-fit col-span-1 lg:col-span-3 xl:col-span-1"
        >
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          <Skeleton className="aspect-video h-30 w-full" />
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
