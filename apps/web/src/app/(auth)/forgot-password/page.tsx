"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { authApi } from "@/lib/auth-api";
import { AuthPage } from "@/components/auth-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send the reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPage title="Reset your password" description="We’ll send a secure link to help you get back into your account." alternateText="Remember your password?" alternateHref="/sign-in" alternateLabel="Sign in">
      {sent ? (
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold">Check your inbox</h2>
          <p className="text-sm leading-6 text-muted-foreground">If an account exists for that email, a reset link is on its way.</p>
          <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">Return to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5">
          {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthPage>
  );
}
