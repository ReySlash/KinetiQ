"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AuthRequiredDialog } from "@/app/(auth)/components/auth-required-dialog";
import StyledLink from "@/components/styled-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteRoutineAction,
  duplicateRoutineAction,
} from "../routine-server-actions";

export function RoutineActions({
  routineSlug,
  visibility,
}: {
  routineSlug: string;
  visibility: "PRIVATE" | "GLOBAL";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  function duplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateRoutineAction(routineSlug);
      if (result.ok) return router.push("/routines");
      if (result.status === 401) setAuthOpen(true);
      else setError(result.message);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteRoutineAction(routineSlug);
      if (result.ok) return router.push("/routines");
      setError(result.message);
    });
  }

  if (visibility === "GLOBAL") {
    return (
      <>
        <Button
          size="lg"
          onClick={duplicate}
          disabled={isPending}
        >
          <Copy />
          {isPending
            ? "Copying…"
            : "Copy to my routines"}
        </Button>
        {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        <AuthRequiredDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <StyledLink href={`/routines/${routineSlug}/edit`} variant="outline" size="lg">
          <Pencil />
          Edit routine
        </StyledLink>
        <Button
          variant="outline"
          size="lg"
          onClick={duplicate}
          disabled={isPending}
        >
          <Copy />
          {isPending ? "Working…" : "Duplicate"}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
        >
          <Trash2 />
          Delete routine
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this routine?</DialogTitle>
            <DialogDescription>
              This permanently deletes the routine and its exercise prescriptions.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={remove}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete routine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
