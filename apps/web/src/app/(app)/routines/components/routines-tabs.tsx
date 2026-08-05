"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { RoutineScope } from "@/lib/routines-api";

export function RoutinesTabs({
  scope,
  children,
}: {
  scope: RoutineScope;
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleScopeChange(value: unknown) {
    if (value !== "my" && value !== "global") return;

    const params = new URLSearchParams(searchParams.toString());
    if (value === "my") params.delete("scope");
    else params.set("scope", value);
    params.delete("page");
    router.push(params.size > 0 ? `/routines?${params.toString()}` : "/routines");
  }

  return (
    <Tabs
      value={scope}
      onValueChange={handleScopeChange}
      className="min-h-0 flex-1"
    >
      <TabsList aria-label="Routine library">
        <TabsTrigger value="global">Global Routines</TabsTrigger>
        <TabsTrigger value="my">My Routines</TabsTrigger>
      </TabsList>
      <TabsContent value={scope} className="flex min-h-0 flex-1 flex-col">
        {children}
      </TabsContent>
    </Tabs>
  );
}
