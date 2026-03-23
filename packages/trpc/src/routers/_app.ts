import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"

export const appRouter = router({
  // 1. Basic Hello Testing
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  // 2. User Info
  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user
  }),

  /**
   * 3. Whiteboard Management
   */
  getWhiteboards: protectedProcedure.query(({ ctx }) => {
    return ctx.db.whiteboard.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: "desc" },
    })
  }),

  createWhiteboard: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.whiteboard.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      })
    }),

  deleteWhiteboard: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.whiteboard.delete({
        where: { 
          id: input.id,
          userId: ctx.session.user.id, // Security: ensure only the owner can delete
        },
      })
    }),
})

// export type definition of API
export type AppRouter = typeof appRouter
