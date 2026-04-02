"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";

export function WhiteboardHeaderSkeleton() {
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
