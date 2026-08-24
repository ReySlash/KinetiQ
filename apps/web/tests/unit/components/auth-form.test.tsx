import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth-form";
import { authApi } from "@/lib/auth-api";

const replace = vi.fn();
const signIn = vi.spyOn(authApi, "signIn");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("callbackURL=%2Froutines"),
}));

describe("AuthForm", () => {
  beforeEach(() => {
    replace.mockReset();
    signIn.mockReset();
  });

  it("prevents mismatched sign-up passwords before calling the API", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="sign-up" />);

    await user.type(screen.getByLabelText("Name"), "Reynaldo");
    await user.type(screen.getByLabelText("Email"), "reynaldo@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
    await user.type(screen.getByLabelText("Repeat password"), "different123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match.");
    expect(signIn).not.toHaveBeenCalled();
  });

  it("redirects to a validated callback after sign-in", async () => {
    signIn.mockResolvedValue({
      session: { id: "session", expiresAt: "2030-01-01" },
      user: { id: "user", name: "Reynaldo", email: "reynaldo@example.com", emailVerified: true },
    });
    const user = userEvent.setup();
    render(<AuthForm mode="sign-in" />);

    await user.type(screen.getByLabelText("Email"), "reynaldo@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn).toHaveBeenCalledWith({
      email: "reynaldo@example.com",
      password: "password123",
      callbackURL: `${window.location.origin}/routines`,
    });
    expect(replace).toHaveBeenCalledWith("/routines");
  });
});
