"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import StyledLink from "@/components/styled-link";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { deleteTrainingProgramAction } from "../training-program-server-actions";

export function TrainingProgramActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTrainingProgramAction(slug);
      if (result.ok) return router.push("/training-programs");
      setError(result.message);
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <StyledLink href={`/training-programs/${slug}/edit`} variant="outline" size="lg">
          <Pencil />
          Edit program
        </StyledLink>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
        >
          <Trash2 />
          Delete program
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
        title="Delete this training program?"
        description="This permanently deletes the program and its schedule. The routines it references will not be deleted."
        cancelLabel="Cancel"
        confirmLabel="Delete program"
        confirmPendingLabel="Deleting…"
        confirmPending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
