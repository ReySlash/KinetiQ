import { ConfirmationDialog } from "@/components/confirmation-dialog";

export function DeleteSetDialog({
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
      title="Delete this set?"
      description="This completed set will be permanently removed from your workout."
      cancelLabel="Go back"
      confirmLabel="Delete set"
      onConfirm={() => {
        onOpenChange(false);
        return onConfirm();
      }}
    />
  );
}
