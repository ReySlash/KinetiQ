import { AuthForm } from "@/components/auth-form";
import { AuthPage } from "@/components/auth-page";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <AuthPage title="Create your account" description="Build a clearer, more consistent training practice with KinetiQ." alternateText="Already have an account?" alternateHref="/sign-in" alternateLabel="Sign in">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </AuthPage>
  );
}
