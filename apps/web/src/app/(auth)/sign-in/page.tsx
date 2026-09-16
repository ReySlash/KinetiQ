import { AuthForm } from "@/app/(auth)/components/auth-form";
import { AuthPage } from "@/app/(auth)/components/auth-page";
import { fetchServerAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function SignInPage() {
  const auth = await fetchServerAuthSession();
  if (auth.status === "authenticated") redirect("/dashboard");

  return (
    <AuthPage title="Welcome back" description="Sign in to continue your training workspace." alternateText="New to KinetiQ?" alternateHref="/sign-up" alternateLabel="Create an account">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthPage>
  );
}
