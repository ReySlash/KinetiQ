"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { deleteTrainingProgram } from "@/lib/training-programs-api";

export function TrainingProgramActions({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrainingProgram(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["training-programs"] });
      router.push("/training-programs");
    },
  });

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
          disabled={deleteMutation.isPending}
        >
          <Trash2 />
          Delete program
        </Button>
      </div>
      {deleteMutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {deleteMutation.error.message}
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
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
