const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

type AuthError = { message?: string; code?: string };

function isAuthError(value: unknown): value is { error: AuthError } {
  return typeof value === "object" && value !== null && "error" in value;
}

function getErrorMessage(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;

  if ("message" in value && typeof value.message === "string") {
    return value.message;
  }

  if (isAuthError(value) && typeof value.error.message === "string") {
    return value.error.message;
  }

  return undefined;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api/auth${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok || isAuthError(payload)) {
    throw new Error(
      getErrorMessage(payload) ?? "Something went wrong. Please try again.",
    );
  }

  return payload as T;
}

export const authApi = {
  getSession: () => request<AuthSession | null>("/get-session"),
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    callbackURL: string;
  }) =>
    request<AuthSession>("/sign-up/email", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  signIn: (input: {
    email: string;
    password: string;
    callbackURL?: string;
  }) =>
    request<AuthSession>("/sign-in/email", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  signOut: () => request<void>("/sign-out", { method: "POST" }),
  requestPasswordReset: (email: string) =>
    request<void>("/request-password-reset", {
      method: "POST",
      body: JSON.stringify({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<void>("/reset-password", {
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
