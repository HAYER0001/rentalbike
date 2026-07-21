"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { BusinessType } from "@/lib/config";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    </div>
  ),
});

export default function ThreeSceneWrapper({
  modelType,
  reducedMotion,
}: {
  modelType: string;
  reducedMotion?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          </div>
        </div>
      }
    >
      <ThreeScene modelType={modelType} />
    </Suspense>
  );
}
