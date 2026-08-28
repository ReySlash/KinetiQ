import { createServer } from "node:http";

const port = 3102;

const server = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");

  if (request.url === "/api/health") {
    response.writeHead(200);
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (request.url?.startsWith("/api/routines")) {
    response.writeHead(401);
    response.end(JSON.stringify({ message: "Authentication required" }));
    return;
  }

  if (request.url === "/api/auth/get-session") {
    response.writeHead(200);
    response.end("null");
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
