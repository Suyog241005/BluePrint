import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user
  }),
})

// export type definition of API
export type AppRouter = typeof appRouter
