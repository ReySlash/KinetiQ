import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type HeroCardProps = {
  thumbnailUrl: string | null;
  imageAltText: string | null;
};

export default function HeroCard(props: HeroCardProps) {
  const { thumbnailUrl, imageAltText } = props;
  return (
    <Card className="aspect-square w-full border-border/70 bg-card/80 p-2">
      <CardContent className="p-2">
        <Image
          src={thumbnailUrl ?? "https://avatar.vercel.sh/shadcn1"}
          alt={imageAltText ?? "Not image description found."}
          className="z-20 rounded-2xl object-cover"
          width={3000}
          height={3000}
        />
      </CardContent>
    </Card>
  );
}
