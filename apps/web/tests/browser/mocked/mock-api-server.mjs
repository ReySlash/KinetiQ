import { createServer } from "node:http";

const port = 3102;
const session = {
  session: {
    id: "mock-session",
    expiresAt: "2099-01-01T00:00:00.000Z",
  },
  user: {
    id: "mock-user",
    name: "Mock User",
    email: "reynaldo@example.com",
    emailVerified: true,
  },
};
const sessionCookie = "better-auth.session_token=mock-session";

function hasSessionCookie(request) {
  return (
    request.headers.cookie
      ?.split(";")
      .some((cookie) => cookie.trim() === sessionCookie) ?? false
  );
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3101");
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Content-Type", "application/json");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.url === "/api/health") {
    response.writeHead(200);
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (request.url === "/api/auth/get-session") {
    response.writeHead(200);
    response.end(JSON.stringify(hasSessionCookie(request) ? session : null));
    return;
  }

  if (request.method === "POST" && request.url === "/api/auth/sign-in/email") {
    const body = await readJsonBody(request);
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (body.email === "wrong@example.com") {
      response.writeHead(401);
      response.end(JSON.stringify({ message: "Invalid credentials" }));
      return;
    }

    response.setHeader(
      "Set-Cookie",
      `${sessionCookie}; Path=/; HttpOnly; SameSite=Lax`,
    );
    response.writeHead(200);
    response.end(JSON.stringify(session));
    return;
  }

  if (request.url?.startsWith("/api/routines")) {
    const authenticated = hasSessionCookie(request);
    response.writeHead(authenticated ? 200 : 401);
    response.end(
      JSON.stringify(authenticated ? [] : { message: "Authentication required" }),
    );
    return;
  }

  response.writeHead(404);
  response.end(JSON.stringify({ message: "Not found" }));
});

server.listen(port, "127.0.0.1");

function shutdown() {
  server.close(() => process.exit(0));
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
