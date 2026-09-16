import { AuthForm } from "@/app/(auth)/components/auth-form";
import { AuthPage } from "@/app/(auth)/components/auth-page";
import { fetchServerAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function SignUpPage() {
  const auth = await fetchServerAuthSession();
  if (auth.status === "authenticated") redirect("/dashboard");

  return (
    <AuthPage title="Create your account" description="Build a clearer, more consistent training practice with KinetiQ." alternateText="Already have an account?" alternateHref="/sign-in" alternateLabel="Sign in">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </AuthPage>
  );
}
