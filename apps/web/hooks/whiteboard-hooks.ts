"use client"

import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

/**
 * Hook to fetch all whiteboards using suspense
 */
export const useSuspenseWhiteboards = (params: { search?: string } = {}) => {
  return trpc.whiteboard.getMany.useSuspenseQuery(params)
}

/**
 * Hook to fetch one whiteboard using suspense
 */
export const useSuspenseWhiteboard = (id: string) => {
  return trpc.whiteboard.getOne.useSuspenseQuery({ id })
}

/**
 * Hook to create new whiteboard
 */
export const useCreateWhiteboard = () => {
  const utils = trpc.useUtils()

  return trpc.whiteboard.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Whiteboard "${data.name}" created successfully`)
      utils.whiteboard.getMany.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`)
    },
  })
}

/**
 * Hook to remove a whiteboard
 */
export const useRemoveWhiteboard = () => {
  const utils = trpc.useUtils()

  return trpc.whiteboard.remove.useMutation({
    onSuccess: (data) => {
      toast.success(`Whiteboard "${data.name}" removed`)
      utils.whiteboard.getMany.invalidate()
      utils.whiteboard.getOne.invalidate({ id: data.id })
    },
    onError: (error) => {
      toast.error(`Failed to remove: ${error.message}`)
    },
  })
}
