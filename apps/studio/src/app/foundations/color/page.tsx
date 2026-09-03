import Link from "next/link";
import { RiArrowLeftLine as ArrowLeft, RiExternalLinkLine as ExternalLink } from "@remixicon/react";

import { ColorLab } from "@/components/foundations/color-lab";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";
import { buttonVariants } from "@ooee/ui";
import { cn } from "@/lib/utils";

export default function ColorFoundationPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
          <Link href="/foundations" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-oe-icon-xsmall" aria-hidden="true" />
              Foundations
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Color</h1>
                <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  Provisional
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Tailwind primitive 전체, ooee가 사용하는 semantic token과 생성형 brand color를 한곳에서 확인합니다.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/material-foundation/material-color-utilities"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
          >
            HCT library
            <ExternalLink data-icon="inline-end" />
          </a>
        </header>

        <StudioPreviewFrame><ColorLab /></StudioPreviewFrame>
      </div>
    </main>
  );
}
