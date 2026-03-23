import { WhiteboardList } from "@/components/whiteboard-list"
import { auth } from "@workspace/better-auth/server"
import { headers } from "next/headers"
import { Suspense } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardHeader, CardContent } from "@workspace/ui/components/card"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user
  if (!user) {
    return redirect("/sign-in")
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 p-8">
      {user && (
        <section>
          <Suspense fallback={<WhiteboardListSkeleton />}>
            <WhiteboardList />
          </Suspense>
        </section>
      )}
    </div>
  )
}

function WhiteboardListSkeleton() {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full max-w-xl rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[220px] rounded-3xl border-slate-100">
            <CardHeader className="gap-2">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
