"use client";

import { useParams, useRouter } from "next/navigation";
import { WhiteboardEditor } from "@/components/whiteboard/whiteboard-editor";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, Share2, MoreHorizontal } from "lucide-react";
import { useSuspenseWhiteboard } from "@/hooks/whiteboard-hooks";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";

export default function WhiteboardPage() {
  const params = useParams();
  const id = params.id as string;

  if (!id) return null;

  return (
    <Suspense fallback={<WhiteboardHeaderSkeleton />}>
      <WhiteboardContent id={id} />
    </Suspense>
  );
}

function WhiteboardContent({ id }: { id: string }) {
  const router = useRouter();
  // useSuspenseQuery returns [data, query]
  const [whiteboard] = useSuspenseWhiteboard(id);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-white">
      {/* 1. Editor Sub-Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/10 px-6 py-3">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="rounded-xl font-bold text-slate-500 transition-all hover:bg-white hover:text-slate-900 active:scale-95"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Home
          </Button>

          <div className="flex flex-col">
            <h1 className="text-xs font-black tracking-widest text-slate-800 uppercase">
              {whiteboard?.name || "Untitled Canvas"}
            </h1>
            <p className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
              LIFETIME AUTO-SAVE ACTIVE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-slate-300 transition-colors hover:text-slate-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-blue-600 px-4 font-bold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Share2 className="mr-2 h-3.5 w-3.5" />
            Invite
          </Button>
        </div>
      </div>

      {/* 2. The Real-time Canvas Area */}
      <main className="relative flex-1">
        <WhiteboardEditor id={id} />
      </main>
    </div>
  );
}

function WhiteboardHeaderSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/10 px-6 py-3">
        <div className="flex items-center gap-6">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
      <div className="relative flex-1 animate-pulse bg-slate-50/30" />
    </div>
  );
}
