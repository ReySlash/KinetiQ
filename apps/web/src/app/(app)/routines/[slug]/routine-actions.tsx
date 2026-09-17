"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AuthRequiredDialog } from "@/app/(auth)/components/auth-required-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import StyledLink from "@/components/styled-link";
import { Button } from "@/components/ui/button";
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
        <Button size="lg" onClick={duplicate} disabled={isPending}>
          <Copy />
          {isPending ? "Copying…" : "Copy to my routines"}
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
      <div className="flex flex-row flex-wrap gap-2 md:justify-end justify-center">
        <StyledLink
          href={`/routines/${routineSlug}/edit`}
          variant="outline"
          size="lg"
          className="w-35 max-w-full justify-center"
        >
          <Pencil />
          Edit routine
        </StyledLink>
        <Button
          variant="outline"
          size="lg"
          className="w-35 max-w-full justify-center"
          onClick={duplicate}
          disabled={isPending}
        >
          <Copy />
          {isPending ? "Working…" : "Duplicate"}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="w-35 max-w-full justify-center"
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
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this routine?"
        description={
          <>
            This permanently deletes the routine and its exercise prescriptions.
            This action cannot be undone.
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Delete routine"
        confirmPendingLabel="Deleting…"
        confirmPending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
