"use client";

import { CollapsibleSidebarNav } from "@ooee/patterns";

import { useStudioPreferences } from "@/components/studio-preferences-provider";

export function CollapsibleSidebarNavExperiment() {
  const { locale } = useStudioPreferences();
  return <CollapsibleSidebarNav locale={locale} />;
}
