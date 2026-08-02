"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authApi } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError("This reset link is missing its token.");
    if (password !== confirmation) return setError("Passwords do not match.");
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setComplete(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to reset your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (complete) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Password updated</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been changed successfully.
        </p>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-primary hover:underline"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmation">Confirm new password</Label>
        <Input
          id="confirmation"
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting || !token}>
        {isSubmitting && <LoaderCircle className="animate-spin" />}
        Update password
      </Button>
    </form>
  );
}
