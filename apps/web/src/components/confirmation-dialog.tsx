"use client";

import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  cancelLabel: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmVariant?: ButtonVariant;
  confirmDisabled?: boolean;
  confirmPending?: boolean;
  confirmPendingLabel?: ReactNode;
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onConfirm,
  confirmVariant = "destructive",
  confirmDisabled = false,
  confirmPending = false,
  confirmPendingLabel,
}: ConfirmationDialogProps) {
  const confirmContent =
    confirmPending && confirmPendingLabel !== undefined
      ? confirmPendingLabel
      : confirmLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="min-w-0 flex-row justify-center">
          <DialogClose
            render={
              <Button
                variant="outline"
                className="min-w-0 flex-1 justify-center whitespace-normal"
              />
            }
          >
            {cancelLabel}
          </DialogClose>
          <Button
            variant={confirmVariant}
            className="min-w-0 flex-1 justify-center whitespace-normal"
            onClick={() => void onConfirm()}
            disabled={confirmDisabled || confirmPending}
          >
            {confirmContent}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
