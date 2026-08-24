"use client";

import { InboxSplitView } from "@ooee/patterns";
import { useStudioPreferences } from "@/components/studio-preferences-provider";
import { cn } from "@/lib/utils";

export function ExperimentPreview() {
  const { theme, locale } = useStudioPreferences();

  return (
    <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className={cn("preview-canvas bg-oe-background-canvas-secondary p-3 text-oe-foreground-primary sm:p-4", theme === "dark" && "dark")} lang={locale}>
        <InboxSplitView key={locale} locale={locale} />
      </div>
    </section>
  );
}
