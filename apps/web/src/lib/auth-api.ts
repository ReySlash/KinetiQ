import { clientRequest } from "@/lib/api/client-request";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
};

export type AuthSession = {
  session: {
    id: string;
    expiresAt: string;
  };
  user: AuthUser;
};

export const authApi = {
  getSession: () => clientRequest<AuthSession | null>("auth/get-session"),
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    callbackURL: string;
  }) =>
    clientRequest<AuthSession>("auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  signIn: (input: {
    email: string;
    password: string;
    callbackURL?: string;
  }) =>
    clientRequest<AuthSession>("auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  signOut: () => clientRequest<void>("auth/sign-out", { method: "POST" }),
  requestPasswordReset: (email: string) =>
    clientRequest<void>("auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    clientRequest<void>("auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};

export function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}
