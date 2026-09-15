"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this training program?</DialogTitle>
            <DialogDescription>
              This permanently deletes the program and its schedule. The routines it references will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={remove}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
