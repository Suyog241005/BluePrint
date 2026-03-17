"use client"

import { authClient } from "@workspace/better-auth/client"

export function AuthButtons() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return <div className="animate-pulse">Loading auth...</div>

  if (session) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
        <div className="flex flex-col">
          <p className="font-medium">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        <button
          onClick={() => authClient.signOut()}
          className="ml-auto px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded hover:opacity-80 transition-opacity"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL: "/",
        })
      }
      className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
    >
      Sign in with Google
    </button>
  )
}
