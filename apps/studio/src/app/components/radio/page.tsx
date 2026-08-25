import Link from "next/link";
import { RiArrowLeftLine } from "@remixicon/react";

import { RadioIndicatorWorkbench } from "@/components/candidates/radio-indicator-workbench";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";

export default function RadioPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/components" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />Components</Link>
          <div><div className="flex items-center gap-2"><h1 className="text-xl font-semibold tracking-tight">Radio</h1><span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">Candidate</span></div><p className="mt-1 max-w-2xl text-sm text-muted-foreground">여러 항목 중 하나를 선택하는 Control과 Field 구성을 검수합니다.</p></div>
        </header>
        <StudioPreviewFrame><RadioIndicatorWorkbench /></StudioPreviewFrame>
      </div>
    </main>
  );
}
