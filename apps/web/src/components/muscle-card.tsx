import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

type MuscleCardProps = {
  bodyRegion: string;
  name: string;
  imageUrl: string | null;
  imageAltText: string | null;
};

export function MuscleCard(props: MuscleCardProps) {
  const { bodyRegion, name, imageUrl, imageAltText } = props;
  return (
    <Card className="relative mx-auto min-w-full max-w-sm pt-0 h-fit col-span-1 lg:col-span-3 xl:col-span-1">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <Image
        src={imageUrl ?? "https://avatar.vercel.sh/shadcn1"}
        alt={imageAltText ?? "Event cover"}
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
        width={20}
        height={20}
      />
      <CardHeader className="h-10">
        <CardAction>
          <Badge variant="secondary">{bodyRegion}</Badge>
        </CardAction>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardFooter className="py-auto">
        <Button className="w-full sticky bottom-0">Details</Button>
      </CardFooter>
    </Card>
  );
}
