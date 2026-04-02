"use client";

import { useEffect, useState, useMemo } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import {
  WHITEBOARD_KEYS,
  createWhiteboardDoc,
  type WhiteboardShape,
} from "@workspace/whiteboard";
import { Button } from "@workspace/ui/components/button";
import {
  Plus,
  Trash2,
  Radio,
  Square,
  Circle,
  Trash,
  MousePointer2,
  Share2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface WhiteboardEditorProps {
  id: string;
}

export function WhiteboardEditor({ id }: WhiteboardEditorProps) {
  const [status, setStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connecting");
  const [shapes, setShapes] = useState<WhiteboardShape[]>([]);

  // 1. Initialize Yjs Doc and Hocuspocus Provider
  const { doc, provider } = useMemo(() => {
    const ydoc = createWhiteboardDoc();
    const p = new HocuspocusProvider({
      url: `ws://localhost:3005/api/whiteboard/${id}`,
      name: id,
      document: ydoc,
      onConnect: () => setStatus("connected"),
      onDisconnect: () => setStatus("disconnected"),
    });
    return { doc: ydoc, provider: p };
  }, [id]);

  // 2. Listen for changes in the Yjs document
  useEffect(() => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);

    const updateState = () => {
      setShapes(Array.from(yShapes.values()));
    };

    yShapes.observe(updateState);
    updateState();

    return () => {
      yShapes.unobserve(updateState);
      provider.destroy();
    };
  }, [doc, provider]);

  // 3. Drawing Helpers
  const addShape = (type: "rect" | "circle") => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);
    const shapeId = Math.random().toString(36).substring(7);

    yShapes.set(shapeId, {
      id: shapeId,
      type,
      x: Math.floor(Math.random() * 500) + 100,
      y: Math.floor(Math.random() * 300) + 100,
      fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    });
  };

  const clearCanvas = () => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);
    yShapes.clear();
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50/50">
      {/* 1. Floating Toolbar */}
      <div className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 px-1 shadow-2xl shadow-slate-900/5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-slate-100/80"
            >
              <MousePointer2 className="h-4 w-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select Tool</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-6 w-px bg-slate-100" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => addShape("circle")}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl transition-all hover:bg-blue-50/50 hover:text-blue-600 active:scale-90"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Circle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => addShape("rect")}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl transition-all hover:bg-orange-50/50 hover:text-orange-600 active:scale-90"
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Rectangle</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-6 w-px bg-slate-100" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={clearCanvas}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-slate-300 transition-all hover:bg-red-50/50 hover:text-red-600 active:scale-95"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Board</TooltipContent>
        </Tooltip>
      </div>

      {/* 2. Status Badge */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1.5 px-3 shadow-lg shadow-slate-950/5 backdrop-blur-md">
          <Radio
            className={`h-3 w-3 ${status === "connected" ? "animate-pulse text-green-500" : "text-red-500"}`}
          />
          <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            {status}
          </span>
        </div>
      </div>

      {/* 3. Infinite Canvas Area */}
      <div className="relative flex-1 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px]">
        {shapes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center opacity-20">
              <Radio className="mx-auto h-12 w-12 text-slate-400" />
              <p className="text-2xl font-black tracking-tighter uppercase">
                Empty Workspace
              </p>
              <p className="font-mono text-xs font-bold">
                Select a tool above to begin
              </p>
            </div>
          </div>
        )}

        <div className="relative h-full w-full p-20">
          {shapes.map((shape) => (
            <div
              key={shape.id}
              className={`absolute transform shadow-xl transition-all duration-700 ease-in-out hover:scale-105 hover:ring-2 hover:ring-blue-500/20 active:opacity-50 ${shape.type === "circle" ? "rounded-full" : "rounded-2xl border border-white/20"}`}
              style={{
                left: shape.x,
                top: shape.y,
                width: 80,
                height: 80,
                backgroundColor: shape.fill,
                boxShadow: `0 20px 40px -10px ${shape.fill}20`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
