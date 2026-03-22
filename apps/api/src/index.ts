import "dotenv/config"
import express from "express"
import cors from "cors"
import expressWs from "express-ws"
import { Hocuspocus } from "@hocuspocus/server"

import {
  auth,
  toNodeHandler,
  fromNodeHeaders,
} from "@workspace/better-auth/server"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter, createTRPCContext } from "@workspace/trpc"

const app = express()
const port = 3005
const { app: wsApp } = expressWs(app)

/**
 * 1. Initialize Hocuspocus Server
 */
const hocuspocus = new Hocuspocus({
  async onConnect({ request, documentName }) {
    // Guest access for demo room
    if (documentName === "demo-room") return

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })

    if (!session) throw new Error("Unauthorized")
    console.log(`📡 Whiteboard: ${session.user.name} joined room ${documentName}`)
  },
})

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
)

// Better Auth
app.all("/api/auth/*splat", toNodeHandler(auth))

// tRPC
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
)

app.use(express.json())

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  res.json(session)
})

/**
 * 2. Whiteboard WebSocket Route
 */
wsApp.ws("/api/whiteboard/:room", async (ws, req) => {
  const roomName = req.params.room || "default-room"
  hocuspocus.handleConnection(ws, req, {
    docName: roomName,
  })
})

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`)
})
