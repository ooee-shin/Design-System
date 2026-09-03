import type { ReactNode } from "react";
import Link from "next/link";
import { RiArrowLeftLine } from "@remixicon/react";

import { getComponent, type ComponentKey } from "@/components/component-registry";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";

export function ComponentDetailPage({ componentKey, children }: { componentKey: ComponentKey; children: ReactNode }) {
  const component = getComponent(componentKey);

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/components" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Components
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{component.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{component.description}</p>
          </div>
        </header>
        <StudioPreviewFrame>{children}</StudioPreviewFrame>
      </div>
    </main>
  );
}
