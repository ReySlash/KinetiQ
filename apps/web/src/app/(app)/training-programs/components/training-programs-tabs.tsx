"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TrainingProgramScope } from "@/types/training-program-types";

export function TrainingProgramsTabs({ scope, children }: { scope: TrainingProgramScope; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleScopeChange(value: unknown) {
    if (value !== "my" && value !== "global") return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "my") params.delete("scope");
    else params.set("scope", value);
    params.delete("offset");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <Tabs value={scope} onValueChange={handleScopeChange} className="min-h-0 flex-1">
      <TabsList aria-label="Training program library">
        <TabsTrigger value="global">Global Programs</TabsTrigger>
        <TabsTrigger value="my">My Programs</TabsTrigger>
      </TabsList>
      <TabsContent value={scope} className="flex min-h-0 flex-1 flex-col">
        {children}
      </TabsContent>
    </Tabs>
  );
}
