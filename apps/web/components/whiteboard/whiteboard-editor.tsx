"use client"

import { useEffect, useState, useMemo } from "react"
import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"
import { WHITEBOARD_KEYS, createWhiteboardDoc, type WhiteboardShape } from "@workspace/whiteboard"
import { Button } from "@workspace/ui/components/button"
import { 
  CircleIcon, 
  MousePointer2Icon, 
  SquareIcon, 
  TrashIcon, 
  PencilIcon,
  PaletteIcon
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { DynamicCanvas } from "@/lib/dynamic-exporter"

interface WhiteboardEditorProps {
  id: string
}

export function WhiteboardEditor({ id }: WhiteboardEditorProps) {
  const [shapes, setShapes] = useState<WhiteboardShape[]>([])
  const [tool, setTool] = useState<string>("SELECT")
  const [color, setColor] = useState<string>("#3b82f6")

  // 1. Initialize Yjs Doc and Hocuspocus Provider
  const { doc, provider } = useMemo(() => {
    const ydoc = createWhiteboardDoc()
    const p = new HocuspocusProvider({
      url: `ws://localhost:3005/api/whiteboard/${id}`,
      name: id,
      document: ydoc,
    })
    return { doc: ydoc, provider: p }
  }, [id])

  // 2. Listen for changes in the Yjs document
  useEffect(() => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)
    const updateState = () => setShapes(Array.from(yShapes.values()))
    
    yShapes.observe(updateState)
    updateState()

    return () => {
      yShapes.unobserve(updateState)
      provider.destroy() 
    }
  }, [doc, provider])

  // 3. Drawing Operations (Bridged to Canvas)
  const onAddShape = (type: WhiteboardShape["type"], x: number, y: number, points?: number[]) => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)
    const shapeId = Math.random().toString(36).substring(7)
    
    yShapes.set(shapeId, {
      id: shapeId,
      type,
      x,
      y,
      points,
      fill: color,
    })
  }

  const onShapeUpdate = (updates: Partial<WhiteboardShape> & { id: string }) => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)
    const existing = yShapes.get(updates.id)
    if (existing) {
      yShapes.set(updates.id, { ...existing, ...updates })
    }
  }

  const clearCanvas = () => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)
    yShapes.clear()
  }

  const tools = [
    { id: "SELECT", icon: MousePointer2Icon, label: "Select" },
    { id: "PENCIL", icon: PencilIcon, label: "Pencil" },
    { id: "CIRCLE", icon: CircleIcon, label: "Circle" },
    { id: "RECT", icon: SquareIcon, label: "Rectangle" },
  ]

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#000000"]

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Floating Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1 bg-white border border-slate-200 shadow-2xl shadow-slate-900/5 rounded-2xl">
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

        <div className="h-6 w-px bg-slate-100 mx-1" />

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

        <div className="h-6 w-px bg-slate-100 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={clearCanvas}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50/50 transition-all active:scale-95"
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
  )
}
