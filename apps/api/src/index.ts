import "dotenv/config"
import express from "express"
import cors from "cors"
import expressWs from "express-ws"
import { Hocuspocus } from "@hocuspocus/server"
import * as Y from "yjs"
import { prisma } from "@workspace/db"

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
 * 1. Initialize Hocuspocus Server with Persistence
 */
const hocuspocus = new Hocuspocus({
  // Step 1: Authentication & Context
  async onConnect({ request, documentName }) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })

    // For testing/guest room, we skip auth check
    if (documentName === "demo-room") {
       return { user: { id: "system" } }
    }

    if (!session) throw new Error("Unauthorized")
    
    // Store user info in context for other hooks
    return {
      user: session.user,
    }
  },

  // Step 2: Load from Database
  async onLoadDocument({ documentName, context }) {
    console.log(`📂 Loading document: ${documentName}`)
    
    // Find the whiteboard in Prisma
    let whiteboard = await prisma.whiteboard.findUnique({
      where: { id: documentName },
    })

    // If it doesn't exist and it's our demo, create a default one
    if (!whiteboard && documentName === "demo-room") {
       // We need a user to own it. We'll use the current user or a fallback.
       const userId = context.user.id !== "system" ? context.user.id : (await prisma.user.findFirst())?.id
       
       if (userId) {
         whiteboard = await prisma.whiteboard.create({
           data: {
             id: "demo-room",
             name: "Demo Whiteboard",
             userId: userId,
           }
         })
       }
    }

    // Return the binary data to Yjs if it exists
    if (whiteboard?.data) {
       return whiteboard.data
    }
    
    return null
  },

  // Step 3: Save to Database
  async onStoreDocument({ documentName, document }) {
    console.log(`💾 Saving document: ${documentName}`)
    
    await prisma.whiteboard.update({
      where: { id: documentName },
      data: {
        data: Buffer.from(Y.encodeStateAsUpdate(document)),
      }
    }).catch(err => {
       console.error("❌ Failed to save whiteboard:", err.message)
    })
  }
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
  const roomName = req.params.room || "demo-room"
  hocuspocus.handleConnection(ws, req, {
    docName: roomName,
  })
})

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port} with Persistence`)
})
