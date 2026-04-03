"use client";
import { useRouter } from "next/navigation";
import { useSuspenseWhiteboard } from "@/hooks/whiteboard-hooks";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, Share2, MoreHorizontal } from "lucide-react";
import { WhiteboardEditor } from "./whiteboard-editor";

export function WhiteboardContent({ id }: { id: string }) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-white">
      <main className="">
        <WhiteboardEditor id={id} />
      </main>
    </div>
  );
}
