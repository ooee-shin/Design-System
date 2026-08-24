import Link from "next/link";
import { RiArrowLeftLine, RiExternalLinkLine } from "@remixicon/react";

import { CollapsibleSidebarNavExperiment } from "@/components/experiments/collapsible-sidebar-nav";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";

export default function CollapsibleSidebarNavPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/patterns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-3.5" aria-hidden="true" />
            Patterns
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Collapsible sidebar nav</h1>
                <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">Experiment</span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">그룹 메뉴, 활성 상태, 검색, 사용자 영역과 축소 rail 동작을 하나의 application sidebar에서 검수합니다.</p>
            </div>
            <Link href="https://vibeprompts.dev/nav/nav-collapsible-sidebar-nav/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              VibePrompt source
              <RiExternalLinkLine className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </header>
        <StudioPreviewFrame><CollapsibleSidebarNavExperiment /></StudioPreviewFrame>
      </div>
    </main>
  );
}
