import Link from "next/link";
import { RiArrowLeftLine as ArrowLeft } from "@remixicon/react";

import { MessageBubbleWorkbench } from "@/components/candidates/message-bubble-workbench";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";

export default function MessageBubblePage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/components" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Components
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Chat</h1>
              <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">Candidate</span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              채팅의 통합 사용 흐름과 메시지, 날짜, 읽음 처리, 첨부, 입력 및 테마 사례를 한곳에서 검수합니다.
            </p>
          </div>
        </header>
        <StudioPreviewFrame><MessageBubbleWorkbench /></StudioPreviewFrame>
      </div>
    </main>
  );
}
