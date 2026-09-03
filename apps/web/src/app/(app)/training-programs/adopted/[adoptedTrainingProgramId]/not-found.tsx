import { Dumbbell } from "lucide-react";

import StyledLink from "@/components/styled-link";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="flex h-dvh w-full items-center justify-center px-2 pb-13 md:pb-2">
      <Empty className="max-w-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Dumbbell /></EmptyMedia>
          <EmptyTitle>Training program not found</EmptyTitle>
          <EmptyDescription>This program does not exist or is not available to your account.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><StyledLink href="/training-programs">Back to training programs</StyledLink></EmptyContent>
      </Empty>
    </main>
  );
}
