import { z } from "zod"
import { router, protectedProcedure } from "../trpc"

export const whiteboardRouter = router({
  // 1. Create Whiteboard
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1, "Name is required") }))
    .mutation(({ ctx, input }) => {
      const { name } = input
      return ctx.db.whiteboard.create({
        data: {
          name,
          userId: ctx.session.user.id,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "ADMIN",
            },
          },
        },
      })
    }),

  // 2. Remove Whiteboard
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.whiteboard.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id, // Only owner can delete
        },
      })
    }),

  // 3. Get Single Whiteboard
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.whiteboard.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),

  // 4. Get All/Many Whiteboards
  getMany: protectedProcedure
    .input(
      z.object({
        search: z.string().optional().default(""),
      })
    )
    .query(({ ctx, input }) => {
      const { search } = input
      return ctx.db.whiteboard.findMany({
        where: {
          userId: ctx.session.user.id,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    }),
})
