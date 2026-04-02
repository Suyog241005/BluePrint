"use client";
import dynamic from "next/dynamic";

export const DynamicCanvas = dynamic(() => import("@/components/konva/demo"), {
  ssr: false,
});
