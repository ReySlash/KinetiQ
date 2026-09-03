import { Dumbbell } from "lucide-react";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { fetchActiveAdoptedTrainingProgram } from "@/lib/adopted-training-programs-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Active training program | KinetiQ",
  description: "Continue your active KinetiQ training program.",
};

export default async function ActiveTrainingProgramPage() {
  const result = await fetchActiveAdoptedTrainingProgram();

  if (result.status === "authenticated" && result.program) {
    redirect(`/training-programs/adopted/${result.program.id}`);
  }

  const unauthenticated = result.status === "unauthenticated";

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="Follow your current multi-week plan.">
        <h1 className="text-lg leading-none font-bold">Active program</h1>
      </PageHeader>
      <Card className="flex min-h-0 flex-1 items-center justify-center">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Dumbbell /></EmptyMedia>
              <EmptyTitle>
                {unauthenticated ? "Sign in to view your active program" : "No active program"}
              </EmptyTitle>
              <EmptyDescription>
                {unauthenticated
                  ? "Your adopted program and workout progress are private to your account."
                  : "Choose a training program from the library when you are ready to begin."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <StyledLink
                href={unauthenticated
                  ? "/sign-in?callbackURL=%2Ftraining-programs%2Factive"
                  : "/training-programs"}
              >
                {unauthenticated ? "Sign in" : "Explore training programs"}
              </StyledLink>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </main>
  );
}
