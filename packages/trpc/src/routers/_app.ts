import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"
import { whiteboardRouter } from "./whiteboard"

/**
 * Main application router
 */
export const appRouter = router({
  // 1. Basic Health/Hello
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  // 2. Auth Identity
  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user
  }),

  // 3. Whiteboard Feature Namespace
  whiteboard: whiteboardRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
