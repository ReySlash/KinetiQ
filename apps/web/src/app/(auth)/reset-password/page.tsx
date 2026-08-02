import { Suspense } from "react";
import { AuthPage } from "@/components/auth-page";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthPage
      title="Choose a new password"
      description="Use a strong password you do not reuse elsewhere."
      alternateText="Remembered your password?"
      alternateHref="/sign-in"
      alternateLabel="Sign in"
    >
      <Suspense
        fallback={
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPage>
  );
}
