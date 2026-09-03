import Link from "next/link";
import { RiArrowLeftLine as ArrowLeft, RiExternalLinkLine as ExternalLink } from "@remixicon/react";

import { ExperimentPreview } from "@/components/experiments/experiment-preview";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";
import { buttonVariants } from "@ooee/ui";
import { cn } from "@/lib/utils";

export default function InboxSplitViewPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Link
              href="/patterns"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Patterns
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Inbox split view</h1>
                <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  Experiment
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Conversation list beside a reading pane
              </p>
            </div>
          </div>
          <a
            href="https://vibeprompts.dev/dashboards/dashboards-inbox-split-view/"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
          >
            원본 보기
            <ExternalLink data-icon="inline-end" />
          </a>
        </header>

        <StudioPreviewFrame><ExperimentPreview /></StudioPreviewFrame>

        <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
          <span>Source · VibePrompt</span>
          <span>Base · shadcn Base UI / Nova</span>
          <span>Stage · 화면 실험</span>
          <span>oe token mapping · Provisional applied</span>
          <Link href="/components/message-bubble" className="font-medium text-foreground underline-offset-4 hover:underline">
            MessageBubble
          </Link>
        </footer>
      </div>
    </main>
  );
}
