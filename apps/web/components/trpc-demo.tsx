"use client"

import { trpc } from "@/lib/trpc"

export function TRPCDemo() {
  const hello = trpc.hello.useQuery({ text: "from tRPC!" })

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h2 className="text-xl font-semibold mb-2">tRPC Connection</h2>
      {hello.data ? (
        <p className="text-green-500">{hello.data.greeting}</p>
      ) : (
        <p className="text-muted-foreground italic">Connecting to tRPC...</p>
      )}
    </div>
  )
}
