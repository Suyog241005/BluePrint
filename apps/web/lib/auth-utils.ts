import { headers } from "next/headers"
import { auth } from "@workspace/better-auth/server"
import { redirect } from "next/navigation"

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect("/signin")
  }
  return session
}

export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (session) {
    redirect("/")
  }
}


