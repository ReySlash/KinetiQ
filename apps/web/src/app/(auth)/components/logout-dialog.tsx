import { ConfirmationDialog } from "@/components/confirmation-dialog";

export function LogoutDialog({
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
      title="Sign out of KinetiQ?"
      description="You can sign back in whenever you are ready to continue training."
      cancelLabel="Cancel"
      confirmLabel="Sign out"
      onConfirm={() => {
        onOpenChange(false);
        return onConfirm();
      }}
    />
  );
}
