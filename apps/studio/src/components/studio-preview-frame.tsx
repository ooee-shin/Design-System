"use client";

import type { ReactNode } from "react";

import { useStudioPreferences } from "@/components/studio-preferences-provider";
import { cn } from "@/lib/utils";

const viewportWidths = {
  desktop: "w-full",
  tablet: "w-[768px]",
  mobile: "w-[390px]",
} as const;

const viewportLabels = {
  desktop: "PC preview, fluid width",
  tablet: "Tablet preview, 768 pixels",
  mobile: "Mobile preview, 390 pixels",
} as const;

export function StudioPreviewFrame({ children }: { children: ReactNode }) {
  const { viewport } = useStudioPreferences();

  return (
    <div className={cn("w-full pb-1", viewport === "desktop" ? "overflow-visible" : "overflow-x-auto")} data-studio-preview-viewport={viewport}>
      <div id="studio-preview" tabIndex={-1} className={cn("@container mx-auto min-w-0 transition-[width] duration-200", viewportWidths[viewport])} aria-label={viewportLabels[viewport]}>
        {children}
      </div>
    </div>
  );
}
