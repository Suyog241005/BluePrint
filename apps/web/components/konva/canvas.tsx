"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { Stage, Layer, Shape, Line } from "react-konva"
import type Konva from "konva"
import type { WhiteboardShape } from "@workspace/whiteboard"
import rough from "roughjs"

interface CanvasProps {
  shapes: WhiteboardShape[]
  onShapeUpdate: (shape: Partial<WhiteboardShape> & { id: string }) => void
  onAddShape: (
    type: WhiteboardShape["type"],
    x: number,
    y: number,
    width?: number,
    height?: number,
    points?: number[],
    seed?: number
  ) => void;
  tool: string;
  color: string;
}

/**
 * 1. RoughShape Wrapper
 * Uses rough.js to "sketch" the shape onto the Konva canvas.
 */
const RoughShape = ({
  shape,
  tool,
  onShapeUpdate,
}: {
  shape: WhiteboardShape;
  tool: string;
  onShapeUpdate: (shape: Partial<WhiteboardShape> & { id: string }) => void;
}) => {
  const isSelected = false; // We'll add this later
  
  return (
    <Shape
      key={shape.id}
      x={shape.x ?? 0}
      y={shape.y ?? 0}
      width={shape.width ?? 80}
      height={shape.height ?? 80}
      draggable={tool === "SELECT"}
      onDragEnd={(e) => {
        onShapeUpdate({
          id: shape.id,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      sceneFunc={(context, konvaShape) => {
        const rc = rough.canvas(context.canvas as any);
        const seed = shape.seed ?? 12345;
        const roughness = shape.roughness ?? 1.5;
        const fill = shape.fill;

        // Setup rough drawing props
        const options = {
          seed,
          roughness,
          stroke: fill,
          strokeWidth: 2,
          fill: shape.type !== "line" ? `${fill}20` : undefined,
          fillStyle: "hachure" as const,
        };

        if (shape.type === "rect") {
          rc.rectangle(0, 0, shape.width ?? 80, shape.height ?? 80, options);
        } else if (shape.type === "circle") {
          const w = shape.width ?? 80;
          const h = shape.height ?? 80;
          const diameter = Math.sqrt(w * w + h * h);
          rc.circle(w / 2, h / 2, diameter, options);
        } else if (shape.type === "line" && shape.points) {
          const pairs: [number, number][] = [];
          for (let i = 0; i < shape.points.length; i += 2) {
            const px = shape.points[i];
            const py = shape.points[i + 1];
            if (px !== undefined && py !== undefined) {
              pairs.push([px, py]);
            }
          }
          if (pairs.length > 0) {
            rc.curve(pairs, options);
          }
        }

        context.fillStrokeShape(konvaShape);
      }}
      hitFunc={(context, konvaShape) => {
        // Draw a simple path for hit detection (invisible to user)
        if (shape.type === "rect") {
          context.beginPath();
          context.rect(0, 0, shape.width ?? 80, shape.height ?? 80);
          context.closePath();
          context.fillStrokeShape(konvaShape);
        } else if (shape.type === "circle") {
          const w = shape.width ?? 80;
          const h = shape.height ?? 80;
          const diameter = Math.sqrt(w * w + h * h);
          context.beginPath();
          context.arc(w / 2, h / 2, diameter / 2, 0, Math.PI * 2);
          context.closePath();
          context.fillStrokeShape(konvaShape);
        } else if (shape.type === "line" && shape.points) {
          // Lines are hard to hit, so we draw a thick invisible boundary
          context.beginPath();
          context.moveTo(shape.points[0] ?? 0, shape.points[1] ?? 0);
          for (let i = 2; i < shape.points.length; i += 2) {
            context.lineTo(shape.points[i] ?? 0, shape.points[i + 1] ?? 0);
          }
          context.lineWidth = 20; // Fat hit area for mouse
          context.stroke();
          context.fillStrokeShape(konvaShape);
        }
      }}
    />
  )
}

export function Canvas({
  shapes,
  onShapeUpdate,
  onAddShape,
  tool,
  color,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [currentLine, setCurrentLine] = useState<number[] | null>(null);
  const [newShape, setNewShape] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: "rect" | "circle";
  } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== "undefined") {
        setSize({ width: window.innerWidth, height: window.innerHeight - 64 })
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - stage.x()) / stage.scaleX();
    const y = (pointer.y - stage.y()) / stage.scaleY();

    if (tool === "PENCIL") {
      setCurrentLine([x, y]);
    } else if (tool === "CIRCLE" || tool === "RECT") {
      setNewShape({
        x,
        y,
        width: 0,
        height: 0,
        type: tool.toLowerCase() as any,
      });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - stage.x()) / stage.scaleX();
    const y = (pointer.y - stage.y()) / stage.scaleY();

    if (tool === "PENCIL" && currentLine) {
      setCurrentLine((prev) => (prev ? [...prev, x, y] : [x, y]));
    } else if (newShape) {
      setNewShape((prev) =>
        prev
          ? {
              ...prev,
              width: x - prev.x,
              height: y - prev.y,
            }
          : null
      );
    }
  };

  const handleMouseUp = () => {
    if (tool === "PENCIL" && currentLine && currentLine.length > 2) {
      const x = currentLine[0]!;
      const y = currentLine[1]!;
      const relativePoints = currentLine.map((p, i) =>
        i % 2 === 0 ? p - x : p - y
      );
      const seed = Math.floor(Math.random() * 1000000);
      onAddShape("line", x, y, undefined, undefined, relativePoints, seed);
      setCurrentLine(null);
    } else if (newShape) {
      const seed = Math.floor(Math.random() * 1000000);
      if (Math.abs(newShape.width) > 5 || Math.abs(newShape.height) > 5) {
        onAddShape(
          newShape.type,
          newShape.x,
          newShape.y,
          newShape.width,
          newShape.height,
          undefined,
          seed
        );
      }
      setNewShape(null);
    } else {
      setCurrentLine(null);
      setNewShape(null);
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
        {shapes.map((shape) => (
          <RoughShape
            key={shape.id}
            shape={shape}
            tool={tool}
            onShapeUpdate={onShapeUpdate}
          />
        ))}

        {currentLine && (
          <Line
            points={currentLine}
            stroke={color}
            strokeWidth={2}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {newShape && (
          <RoughShape
            key="ghost"
            shape={{
              id: "ghost",
              type: newShape.type,
              x: newShape.x,
              y: newShape.y,
              width: newShape.width,
              height: newShape.height,
              fill: color,
              seed: 42,
              roughness: 1.2,
            }}
            tool="NONE"
            onShapeUpdate={() => {}}
          />
        )}
      </Layer>
    </Stage>
  )
}
