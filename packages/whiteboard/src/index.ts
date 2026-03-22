import * as Y from "yjs"

/**
 * 1. Document Keys
 * These identify the specific collections in your Y.Doc
 */
export const WHITEBOARD_KEYS = {
  SHAPES: "shapes", // Map of id -> Shape
  AWARENESS: "awareness", // User presence (cursors, colors)
} as const

/**
 * 2. Shared Types
 * This defines what a "Shape" is in your system
 */
export type WhiteboardShape = {
  id: string
  type: "rect" | "circle" | "line" | "text"
  x: number
  y: number
  width?: number
  height?: number
  fill: string
  opacity?: number
}

/**
 * 3. Helper to initialize a clean Doc
 */
export function createWhiteboardDoc() {
  const doc = new Y.Doc()
  return doc
}
