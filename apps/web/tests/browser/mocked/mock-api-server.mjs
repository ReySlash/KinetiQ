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

const server = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");

  if (request.url === "/api/health") {
    response.writeHead(200);
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (request.url?.startsWith("/api/routines")) {
    response.writeHead(200);
    response.end(JSON.stringify([]));
    return;
  }

  if (request.url === "/api/auth/get-session") {
    response.writeHead(200);
    response.end(JSON.stringify(session));
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
