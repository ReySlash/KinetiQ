"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex h-dvh w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Analytics is temporarily unavailable</CardTitle></CardHeader>
        <CardContent><Button onClick={reset}>Try again</Button></CardContent>
      </Card>
    </main>
  );
}
