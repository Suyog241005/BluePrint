import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "@workspace/better-auth/server"
import { prisma } from "@workspace/db"
import { fromNodeHeaders } from "@workspace/better-auth/server"

/**
 * Context creation function for tRPC.
 * This will be called for every request.
 */
export const createTRPCContext = async (opts: { req: any; res?: any }) => {
  // Extract headers
  const headers = "headers" in opts.req ? opts.req.headers : new Headers()
  
  // Debug: Let's see if cookies are even arriving
  const cookieHeader = "get" in headers ? (headers as any).get("cookie") : (headers as any)["cookie"]
  console.log(`[tRPC Context] Request from: ${opts.req.method} ${opts.req.url}`)
  console.log(`[tRPC Context] Has Cookies: ${!!cookieHeader}`)

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  })

  if (session) {
    console.log(`[tRPC Context] Session found for user: ${session.user.id}`)
  } else {
    console.log(`[tRPC Context] No session found`)
  }

  return {
    db: prisma,
    session,
  }
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createTRPCContext>().create()

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})
