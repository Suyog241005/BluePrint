import { Suspense } from "react";
import { WhiteboardContent } from "@/components/whiteboard/whiteboard-content";
import { WhiteboardHeaderSkeleton } from "@/components/whiteboard/skeleton/whiteboard-header-skeleton";

export default async function WhiteboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  if (!id) return null;

  return (
    <Suspense fallback={<WhiteboardHeaderSkeleton />}>
      <WhiteboardContent id={id} />
    </Suspense>
  );
}
