import { ConfirmationDialog } from "@/components/confirmation-dialog";

type CancelWorkoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function CancelWorkoutDialog(props: CancelWorkoutDialogProps) {
  const { open, onOpenChange, onConfirm } = props;
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel this workout?"
      description={
        <>
          This workout will be marked as cancelled. You can start it again
          later but your recorded sets will be lost.
        </>
      }
      cancelLabel="Go back"
      confirmLabel="Cancel workout"
      onConfirm={() => {
        onOpenChange(false);
        return onConfirm();
      }}
    />
  );
}
