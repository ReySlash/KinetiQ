"use client";

import { useEffect } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
      <PageHeader subtitle="Follow your current multi-week plan.">
        <h1 className="text-lg leading-none font-bold">Active program</h1>
      </PageHeader>
      <Card className="flex min-h-0 flex-1 items-center justify-center">
        <CardHeader className="text-center">
          <CardTitle>Active program unavailable</CardTitle>
          <CardDescription>We could not load your program. Try again without losing your place.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center"><Button onClick={reset}>Try again</Button></CardContent>
      </Card>
    </main>
  );
}
