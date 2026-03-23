import { WhiteboardList } from "@/components/whiteboard-list"
import { auth } from "@workspace/better-auth/server"
import { headers } from "next/headers"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 p-8">
      {user && (
        <section>
          <WhiteboardList />
        </section>
      )}
    </div>
  )
}
