"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import type Konva from "konva";
import type { WhiteboardShape } from "@workspace/whiteboard";

interface CanvasProps {
  shapes: WhiteboardShape[];
  onShapeUpdate: (shape: Partial<WhiteboardShape> & { id: string }) => void;
  onAddShape: (
    type: WhiteboardShape["type"],
    x: number,
    y: number,
    points?: number[]
  ) => void;
  tool: string;
  color: string;
}

export function Canvas({
  shapes,
  onShapeUpdate,
  onAddShape,
  tool,
  color,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);

  // 1. Stage State: Panning & Zooming
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  // 2. Local State: Currently drawing (unsynced yet)
  const [currentLine, setCurrentLine] = useState<number[] | null>(null);

  // -- Maintain responsive size --
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== "undefined") {
        setSize({ width: window.innerWidth, height: window.innerHeight - 64 });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // -- Handlers: Zoom (Wheel) --
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Scale factor
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Zoom point calculation
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // -- Handlers: Drawing --
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    // Get absolute mouse position on the board
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - stage.x()) / stage.scaleX();
    const y = (pointer.y - stage.y()) / stage.scaleY();

    if (tool === "PENCIL") {
      setCurrentLine([x, y]);
    } else if (tool === "CIRCLE" || tool === "RECT") {
      onAddShape(tool.toLowerCase() as any, x, y);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (tool !== "PENCIL" || !currentLine || !stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - stage.x()) / stage.scaleX();
    const y = (pointer.y - stage.y()) / stage.scaleY();

    setCurrentLine((prev) => (prev ? [...prev, x, y] : [x, y]));
  };

  const handleMouseUp = () => {
    if (tool === "PENCIL" && currentLine && currentLine.length > 2) {
      // Finalize the line and send to Yjs
      const x = currentLine[0];
      const y = currentLine[1];

      if (x && y) {
        // Shift points relative to x,y for easier dragging/offsetting later
        const relativePoints = currentLine.map((p, i) =>
          i % 2 === 0 ? p - x : p - y
        );

        onAddShape("line", x, y, relativePoints);
      }
      setCurrentLine(null);
    } else {
      setCurrentLine(null);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={size.width}
      height={size.height}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      draggable={tool === "SELECT"}
      className="cursor-crosshair bg-slate-50/50"
    >
      <Layer>
        {/* Render Synced Shapes */}
        {shapes.map((shape) => {
          if (shape.type === "rect") {
            return (
              <Rect
                key={shape.id}
                x={shape.x ?? 0}
                y={shape.y ?? 0}
                width={80}
                height={80}
                fill={shape.fill}
                shadowBlur={10}
                shadowOpacity={0.1}
                draggable={tool === "SELECT"}
                cornerRadius={12}
              />
            );
          }
          if (shape.type === "circle") {
            return (
              <Circle
                key={shape.id}
                x={shape.x ?? 0}
                y={shape.y ?? 0}
                radius={40}
                fill={shape.fill}
                shadowBlur={10}
                shadowOpacity={0.1}
                draggable={tool === "SELECT"}
              />
            );
          }
          if (shape.type === "line" && shape.points) {
            return (
              <Line
                key={shape.id}
                x={shape.x ?? 0}
                y={shape.y ?? 0}
                points={shape.points}
                stroke={shape.fill}
                strokeWidth={4}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                draggable={tool === "SELECT"}
              />
            );
          }
          return null;
        })}

        {/* Render active pencil line (local only until done) */}
        {currentLine && (
          <Line
            points={currentLine}
            stroke={color}
            strokeWidth={4}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Layer>
    </Stage>
  );
}
