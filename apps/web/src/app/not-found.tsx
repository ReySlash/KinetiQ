"use client";

import { usePathname } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import StyledLink from "@/components/styled-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

function getParentPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.length > 1 ? `/${segments.slice(0, -1).join("/")}` : "/";
}

export default function NotFound() {
  const pathname = usePathname();

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="The page you are looking for does not exist.">
        <h1 className="text-lg font-bold leading-none">404 - Not Found</h1>
      </PageHeader>

      <section className="flex min-h-0 flex-1 items-center justify-center rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-2 text-center">
            <CardTitle>404 - Not Found</CardTitle>
            <CardDescription>
              The page you are looking for does not exist.
            </CardDescription>
          </CardContent>
          <CardFooter className="justify-center">
            <StyledLink href={getParentPath(pathname)} size="lg">
              Go back
            </StyledLink>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
