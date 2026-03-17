import "dotenv/config"
import express from "express"
import cors from "cors"
import { auth, toNodeHandler, fromNodeHeaders } from "@workspace/better-auth/server"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter, createTRPCContext } from "@workspace/trpc"

const app = express()
const port = 3005

// Configure CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
)

// Better Auth handler
app.all("/api/auth/*splat", toNodeHandler(auth))

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

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
