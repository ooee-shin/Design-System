import Link from "next/link";
import { RiArrowLeftLine } from "@remixicon/react";

import { PresentationEntryList } from "@/components/presentation-entry-list";

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Home
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Presentation</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              결과물만으로는 보이지 않는 작업 의도를 전달합니다. 무엇이 문제였고, 어떻게 바꿨고, 그래서 무엇이 좋아졌는지를 하나의 판단 단위로 묶어 기록합니다.
            </p>
          </div>
        </header>

        <PresentationEntryList />
      </div>
    </main>
  );
}
