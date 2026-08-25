"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WorkoutSessionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [isPending, startTransition] = useTransition();

  function applyFilters() {
    const next = new URLSearchParams(searchParams.toString());
    if (status === "all") next.delete("status"); else next.set("status", status);
    startTransition(() => router.push(next.toString() ? `${pathname}?${next}` : pathname));
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-border/70 p-3">
      <div className="grid gap-2">
        <Label htmlFor="workout-status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger id="workout-status" className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All workouts</SelectItem><SelectItem value="IN_PROGRESS">In progress</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent>
        </Select>
      </div>
      <Button type="button" variant="outline" onClick={applyFilters} disabled={isPending}>Apply filters</Button>
    </div>
  );
}
