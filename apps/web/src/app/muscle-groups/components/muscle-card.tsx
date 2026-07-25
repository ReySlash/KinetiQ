import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type MuscleCardProps = {
  bodyRegion: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  imageAltText: string | null;
};

export function MuscleCard(props: MuscleCardProps) {
  const { bodyRegion, name, slug, imageUrl, imageAltText } = props;
  return (
    <Card className="relative mx-auto min-w-full max-w-sm pt-0 h-fit w-full">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <Image
        src={imageUrl ?? "https://avatar.vercel.sh/shadcn1"}
        alt={imageAltText ?? "Event cover"}
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
        width={20}
        height={20}
      />
      <CardHeader className="h-6">
        <CardTitle>{name}</CardTitle>
        <CardAction>
          <Badge variant="secondary">{bodyRegion}</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="py-auto">
        <Link className="w-full" href={`/muscle-groups/${slug}`}>
          <Button className="w-full" variant={"default"}>
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
