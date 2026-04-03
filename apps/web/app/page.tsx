import { Suspense } from "react";
import { WhiteboardList } from "@/components/whiteboard/whiteboard-list";
import { requireAuth } from "@/lib/auth-utils";
import { WhiteboardListSkeleton } from "@/components/whiteboard/skeleton/whiteboard-list-skeleton";

export default async function Home() {
  await requireAuth();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 p-8">
      <section>
        <Suspense fallback={<WhiteboardListSkeleton />}>
          <WhiteboardList />
        </Suspense>
      </section>
    </div>
  );
}
