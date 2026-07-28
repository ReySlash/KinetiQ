import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type HeroCardProps = {
  thumbnailUrl: string | null;
  imageAltText: string | null;
};

export default function HeroCard(props: HeroCardProps) {
  const { thumbnailUrl, imageAltText } = props;
  return (
    <Card className="p-2 w-full aspect-square">
      <CardContent className="p-2">
        <Image
          src={thumbnailUrl ?? "https://avatar.vercel.sh/shadcn1"}
          alt={imageAltText ?? "Not image description found."}
          className="z-20 object-cover rounded-3xl"
          width={3000}
          height={3000}
        />
      </CardContent>
    </Card>
  );
}
