import { ApiError } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type { AuthSession } from "@/lib/auth-api";

export type ServerAuthResult =
  | { status: "authenticated"; session: AuthSession }
  | { status: "unauthenticated" };

export async function fetchServerAuthSession(): Promise<ServerAuthResult> {
  try {
    const session = await serverRequest<AuthSession | null>("auth/get-session");
    return session
      ? { status: "authenticated", session }
      : { status: "unauthenticated" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "unauthenticated" };
    }
    throw error;
  }
}
