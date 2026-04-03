"use client";
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
