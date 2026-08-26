"use client";

import type { ReactNode } from "react";

import { useStudioPreferences } from "@/components/studio-preferences-provider";

export function PreviewLocaleScope({ children, className }: { children: ReactNode; className?: string }) {
  const { locale } = useStudioPreferences();
  return <div className={`component-preview-locale ${className ?? ""}`} lang={locale}>{children}</div>;
}
