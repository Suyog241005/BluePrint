"use client";
import dynamic from "next/dynamic";

export const DynamicCanvas = dynamic(
  () => import("@/components/konva/canvas").then((mod) => mod.Canvas),
  {
    ssr: false,
  }
);
