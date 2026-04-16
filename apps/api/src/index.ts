import "dotenv/config";
import express from "express";
import cors from "cors";
import expressWs from "express-ws";
import * as trpcExpress from "@trpc/server/adapters/express";

import {
  auth,
  toNodeHandler,
  fromNodeHeaders,
} from "@workspace/better-auth/server";
import { appRouter, createTRPCContext } from "@workspace/trpc";
import { hocuspocus } from "@workspace/hocuspocus/server";

const app = express();
const port = 3005;
const { app: wsApp } = expressWs(app);

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Better Auth
app.all("/api/auth/*splat", toNodeHandler(auth));

// tRPC
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

app.use(express.json());

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.json(session);
});

/**
 * Whiteboard WebSocket Route
 */
wsApp.ws("/api/whiteboard/:room", async (ws, req) => {
  // Let Hocuspocus automatically handle the document identifier
  // from the provider's 'name' property.
  hocuspocus.handleConnection(ws, req);
});

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
});
