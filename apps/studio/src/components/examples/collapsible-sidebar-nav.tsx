"use client";

import { CollapsibleSidebarNav } from "@ooee/patterns";

import { useStudioPreferences } from "@/components/studio-preferences-provider";

export function CollapsibleSidebarNavExample() {
  const { locale } = useStudioPreferences();
  return <CollapsibleSidebarNav locale={locale} />;
}
