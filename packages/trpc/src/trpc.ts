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
  
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  })

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
