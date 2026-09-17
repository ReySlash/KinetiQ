import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "@/components/confirmation-dialog";

describe("ConfirmationDialog", () => {
  it("renders the title, description, and equal-width actions in order", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Delete this routine?"
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete routine"
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Delete this routine?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();

    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", { name: "Delete routine" });
    expect(cancel).toHaveClass("flex-1", "min-w-0");
    expect(confirm).toHaveClass("flex-1", "min-w-0", "text-destructive");
    expect(
      cancel.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("calls the cancel and confirm callbacks", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialog
        open
        onOpenChange={onOpenChange}
        title="Sign out?"
        description="You can sign back in later."
        cancelLabel="Stay"
        confirmLabel="Sign out"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Stay" }));
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("shows the pending label and disables confirmation", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Delete this set?"
        description="The set will be removed."
        cancelLabel="Go back"
        confirmLabel="Delete set"
        confirmPendingLabel="Deleting…"
        confirmPending
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Go back" })).not.toBeDisabled();
  });
});
