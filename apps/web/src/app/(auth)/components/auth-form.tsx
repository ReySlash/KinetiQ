"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authApi, getSafeRedirect } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "sign-in" | "sign-up";

function PasswordField({
  id,
  value,
  onChange,
  label,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(false);

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignUp && password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await authApi.signUp({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL: `${window.location.origin}/dashboard`,
        });
        setVerificationNotice(true);
      } else {
        const callbackURL = getSafeRedirect(searchParams.get("callbackURL"));
        await authApi.signIn({
          email: email.trim(),
          password,
          callbackURL: `${window.location.origin}${callbackURL}`,
        });
        router.replace(callbackURL);
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to complete the request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (verificationNotice) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          ✓
        </div>
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
          Verify your email before signing in.
        </p>
        <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {isSignUp && (
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      </div>
      <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete={isSignUp ? "new-password" : "current-password"} />
      {isSignUp && (
        <PasswordField
          id="password-confirmation"
          label="Repeat password"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          autoComplete="new-password"
        />
      )}
      {!isSignUp && (
        <Link href="/forgot-password" className="-mt-2 text-right text-sm text-muted-foreground hover:text-primary">
          Forgot password?
        </Link>
      )}
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="animate-spin" />}
        {isSignUp ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
