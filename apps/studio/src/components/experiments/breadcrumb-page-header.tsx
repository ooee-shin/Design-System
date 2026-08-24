"use client";

import { BreadcrumbPageHeader } from "@ooee/patterns";

import { useStudioPreferences } from "@/components/studio-preferences-provider";

export function BreadcrumbPageHeaderExperiment() {
  const { locale } = useStudioPreferences();
  return <BreadcrumbPageHeader locale={locale} />;
}
