"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthRequiredDialog } from "@/components/auth-required-dialog";
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
  deleteRoutine,
  duplicateRoutine,
} from "@/lib/routines-api";
import { ApiError as RoutineApiError } from "@/lib/api/error";

export function RoutineActions({
  routineSlug,
  visibility,
}: {
  routineSlug: string;
  visibility: "PRIVATE" | "GLOBAL";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteRoutine(routineSlug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["routines"] });
      router.push("/routines");
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: () => duplicateRoutine(routineSlug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["routines"] });
      router.push("/routines");
    },
    onError: (error) => {
      if (error instanceof RoutineApiError && error.status === 401) {
        setAuthOpen(true);
      }
    },
  });

  if (visibility === "GLOBAL") {
    return (
      <>
        <Button
          size="lg"
          onClick={() => duplicateMutation.mutate()}
          disabled={duplicateMutation.isPending}
        >
          <Copy />
          {duplicateMutation.isPending
            ? "Copying…"
            : "Copy to my routines"}
        </Button>
        {duplicateMutation.isError &&
          !(
            duplicateMutation.error instanceof RoutineApiError &&
            duplicateMutation.error.status === 401
          ) && (
            <p role="alert" className="text-sm text-destructive">
              {duplicateMutation.error.message}
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
          onClick={() => duplicateMutation.mutate()}
          disabled={duplicateMutation.isPending || deleteMutation.isPending}
        >
          <Copy />
          {duplicateMutation.isPending ? "Duplicating…" : "Duplicate"}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setDeleteOpen(true)}
          disabled={duplicateMutation.isPending || deleteMutation.isPending}
        >
          <Trash2 />
          Delete routine
        </Button>
      </div>
      {(duplicateMutation.isError || deleteMutation.isError) && (
        <p role="alert" className="text-sm text-destructive">
          {(duplicateMutation.error ?? deleteMutation.error)?.message}
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
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete routine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
