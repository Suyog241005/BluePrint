import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // NEXT_PUBLIC_ is required for Next.js to expose this to the browser
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

export type AuthClientType = typeof authClient
