import { ConfirmationDialog } from "@/components/confirmation-dialog";

export function FinishWorkoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Finish this workout?"
      description="Your completed sets will be saved and this workout will be added to your history."
      cancelLabel="Keep working out"
      confirmLabel="Finish workout"
      confirmVariant="default"
      onConfirm={() => {
        onOpenChange(false);
        return onConfirm();
      }}
    />
  );
}
