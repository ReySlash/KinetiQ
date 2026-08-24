import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { authApi } from "@/lib/auth-api";
import { server } from "../../mocks/server";

const session = {
  session: { id: "session", expiresAt: "2030-01-01" },
  user: { id: "user", name: "Reynaldo", email: "reynaldo@example.com", emailVerified: true },
};

describe("auth API", () => {
  it("maps the session and account actions through the client boundary", async () => {
    server.use(
      http.all("http://localhost:3000/api/*", () => HttpResponse.json(session)),
    );

    await expect(authApi.getSession()).resolves.toEqual(session);
    await expect(authApi.signUp({ name: "Reynaldo", email: "reynaldo@example.com", password: "password123", callbackURL: "/dashboard" })).resolves.toEqual(session);
    await expect(authApi.signIn({ email: "reynaldo@example.com", password: "password123", callbackURL: "/dashboard" })).resolves.toEqual(session);
    await expect(authApi.signOut()).resolves.toEqual(session);
    await expect(authApi.requestPasswordReset("reynaldo@example.com")).resolves.toEqual(session);
    await expect(authApi.resetPassword("token", "new-password123")).resolves.toEqual(session);
  });
});
