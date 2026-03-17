import { prisma } from "@workspace/db"
import { AuthButtons } from "@/components/auth-buttons"
import { TRPCDemo } from "@/components/trpc-demo"
import { auth } from "@workspace/better-auth/server"
import { headers } from "next/headers"

export default async function Home() {
  const user = await prisma.user.findFirst()
  const session = await auth.api.getSession({
    headers: await headers(), // Pass Next.js headers to the auth engine
  })
  return (
    <div className="space-y-6 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Workspace Blueprint</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <AuthButtons />
        <div className="p-3 bg-muted rounded text-sm">
          Session check: {session?.user?.name ?? "No session"}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">tRPC & API</h2>
        <TRPCDemo />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Database</h2>
        <div className="p-3 bg-muted rounded text-sm">
          Check: {user?.name ?? "No user added yet"}
        </div>
      </section>
    </div>
  )
}
