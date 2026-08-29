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
  return request.headers.cookie?.split(";").some((cookie) =>
    cookie.trim().startsWith(sessionCookie),
  );
}

const server = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");

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

  if (request.url?.startsWith("/api/routines")) {
    response.writeHead(hasSessionCookie(request) ? 200 : 401);
    response.end(
      JSON.stringify(
        hasSessionCookie(request)
          ? []
          : { message: "Authentication required" },
      ),
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
