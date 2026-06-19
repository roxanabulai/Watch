import { createServer } from "node:http";
import { AsyncLocalStorage } from "node:async_hooks";
import { loadEnvConfig } from "@next/env";
import { Server } from "socket.io";

if (typeof globalThis.AsyncLocalStorage === "undefined") {
  Object.defineProperty(globalThis, "AsyncLocalStorage", {
    configurable: true,
    writable: true,
    value: AsyncLocalStorage
  });
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

async function main() {
  loadEnvConfig(process.cwd(), dev);
  const [{ default: next }, { handleSocketBid }] = await Promise.all([import("next"), import("./lib/socket-bids")]);
  const app = next({ dev, hostname, port });
  const handler = app.getRequestHandler();

  console.log("Starting Next custom server...");

  await app.prepare();
  console.log("Next app prepared");

  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("auction:join", (auctionId: string) => socket.join(`auction:${auctionId}`));
    socket.on("auction:leave", (auctionId: string) => socket.leave(`auction:${auctionId}`));
    socket.on("auction:bid", async (payload, ack) => {
      const result = await handleSocketBid(payload, socket.handshake.headers.cookie ?? "");
      if (result.ok) {
        io.to(`auction:${payload.auctionId}`).emit("auction:update", result.data);
      }
      ack?.(result);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Ready on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
