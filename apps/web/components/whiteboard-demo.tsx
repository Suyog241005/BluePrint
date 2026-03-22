"use client"

import { useEffect, useState, useMemo } from "react"
import { HocuspocusProvider } from "@hocuspocus/provider"

import { WHITEBOARD_KEYS, createWhiteboardDoc, type WhiteboardShape } from "@workspace/whiteboard"
import { Button } from "@workspace/ui/components/button"

export function WhiteboardDemo() {
  const [status, setStatus] = useState<"connected" | "connecting" | "disconnected">("connecting")
  const [shapes, setShapes] = useState<WhiteboardShape[]>([])

  // 1. Initialize Yjs Doc and Hocuspocus Provider
  const { doc, provider } = useMemo(() => {
    const ydoc = createWhiteboardDoc()
    const p = new HocuspocusProvider({
      url: "ws://localhost:3005/api/whiteboard/demo-room",
      name: "demo-room",
      document: ydoc,
      // Hocuspocus will automatically use cookies for authentication from the browser
      onConnect: () => setStatus("connected"),
      onDisconnect: () => setStatus("disconnected"),
    })
    return { doc: ydoc, provider: p }
  }, [])

  // 2. Listen for changes in the Yjs document
  useEffect(() => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)

    const updateState = () => {
      // Convert Y.Map values back to a normal array for React
      setShapes(Array.from(yShapes.values()))
    }

    yShapes.observe(updateState)
    updateState()

    return () => {
      yShapes.unobserve(updateState)
      provider.destroy() // Stop syncing when component is removed
    }
  }, [doc, provider])

  // 3. Helper to add a random shape
  const addRandomCircle = () => {
    const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)
    const id = Math.random().toString(36).substring(7)
    
    yShapes.set(id, {
      id,
      type: "circle",
      x: Math.floor(Math.random() * 200),
      y: Math.floor(Math.random() * 200),
      fill: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    })
  }

  const clearCanvas = () => {
     const yShapes = doc.getMap<WhiteboardShape>(WHITEBOARD_KEYS.SHAPES)
     yShapes.clear()
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 border rounded-xl bg-card shadow-sm">
      <div className="flex flex-row items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Hocuspocus Demo</h2>
          <p className="text-sm text-muted-foreground">Real-time Yjs Sync (demo-room)</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border">
           <span className={`h-2.5 w-2.5 rounded-full ${status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`} />
           <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={addRandomCircle} disabled={status !== 'connected'}>
          Add Random Circle
        </Button>
        <Button variant="outline" onClick={clearCanvas} disabled={status !== 'connected'}>
          Clear All
        </Button>
      </div>

      <div className="relative w-full h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden">
        {shapes.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Open two tabs to see the magic sync!
           </div>
        )}
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
            style={{
              left: shape.x,
              top: shape.y,
              width: 40,
              height: 40,
              backgroundColor: shape.fill,
            }}
          />
        ))}
      </div>
      
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic">
        Tip: Make sure you're logged in with GitHub/Discord, or the connection will stay "connecting" (it needs your better-auth session).
      </div>
    </div>
  )
}
