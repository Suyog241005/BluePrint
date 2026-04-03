"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import {
  WHITEBOARD_KEYS,
  createWhiteboardDoc,
  type WhiteboardShape,
} from "@workspace/whiteboard";
import { Button } from "@workspace/ui/components/button";
import {
  CircleIcon,
  MousePointer2Icon,
  SquareIcon,
  TrashIcon,
  PencilIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { DynamicCanvas } from "@/lib/dynamic-exporter";

interface WhiteboardEditorProps {
  id: string;
}

export function WhiteboardEditor({ id }: WhiteboardEditorProps) {
  const [shapes, setShapes] = useState<WhiteboardShape[]>([]);
  const [tool, setTool] = useState<string>("SELECT");
  const [color, setColor] = useState<string>("#3b82f6");

  // Create Y.Doc and Provider once per board ID — no session dependency
  const { doc, provider } = useMemo(() => {
    const ydoc = createWhiteboardDoc();
    const p = new HocuspocusProvider({
      url: `ws://localhost:3005/api/whiteboard/${id}`,
      name: id,
      document: ydoc,
    });
    return { doc: ydoc, provider: p };
  }, [id]);

  useEffect(() => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);

    const updateState = () => {
      const current = Array.from(yShapes.values());
      console.log(`🎨 Whiteboard Sync: Found ${current.length} shapes`);
      setShapes(current);
    };

    yShapes.observe(updateState);
    updateState();

    provider.on("synced", () => {
      console.log("✅ Hocuspocus Synced!");
      updateState();
    });

    provider.on("status", ({ status }: { status: string }) => {
      console.log(`📡 Connection Status: ${status}`);
    });

    return () => {
      yShapes.unobserve(updateState);
      provider.destroy();
    };
  }, [doc, provider]);

  const onAddShape = (
    type: "rect" | "circle" | "line" | "text",
    x: number,
    y: number,
    width?: number,
    height?: number,
    points?: number[],
    seed?: number
  ) => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);
    const shapeId = Math.random().toString(36).substring(7);

    yShapes.set(shapeId, {
      id: shapeId,
      type,
      x,
      y,
      width,
      height,
      points,
      fill: color,
      seed: seed ?? Math.floor(Math.random() * 1000000),
      roughness: 1.5,
    });
  };

  const onShapeUpdate = (
    updates: Partial<WhiteboardShape> & { id: string }
  ) => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);
    const existing = yShapes.get(updates.id);
    if (existing) {
      yShapes.set(updates.id, { ...existing, ...updates });
    }
  };

  const clearCanvas = () => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES);
    yShapes.clear();
  };

  const tools = [
    { id: "SELECT", icon: MousePointer2Icon, label: "Select" },
    { id: "PENCIL", icon: PencilIcon, label: "Pencil" },
    { id: "CIRCLE", icon: CircleIcon, label: "Circle" },
    { id: "RECT", icon: SquareIcon, label: "Rectangle" },
  ];

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#000000",
  ];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50">
      {/* Floating Toolbar */}
      <div className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-900/5">
        {tools.map((t) => (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setTool(t.id)}
                variant={tool === t.id ? "secondary" : "ghost"}
                size="icon"
                className={`h-10 w-10 rounded-xl transition-all ${tool === t.id ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100/80"}`}
              >
                <t.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="mx-1 h-6 w-px bg-slate-100" />

        {/* Color Picker */}
        <div className="flex items-center gap-1 px-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full border-2 transition-all hover:scale-125 ${color === c ? "border-slate-300 ring-2 ring-blue-500/20" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-slate-100" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={clearCanvas}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-slate-300 transition-all hover:bg-red-50/50 hover:text-red-600 active:scale-95"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Board</TooltipContent>
        </Tooltip>
      </div>

      {/* The Interactive Konva Canvas */}
      <DynamicCanvas
        shapes={shapes}
        onShapeUpdate={onShapeUpdate}
        onAddShape={onAddShape}
        tool={tool}
        color={color}
      />
    </div>
  );
}
