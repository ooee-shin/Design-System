import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

export default function FieldPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/components" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Components
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Field</h1>
              <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">페이지 준비</span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Label, Input, 도움말과 오류 문구를 연결하는 Field를 정리할 페이지입니다.</p>
          </div>
        </header>

        <section className="rounded-2xl border bg-background p-5">
          <h2 className="text-sm font-semibold text-foreground">현재 정의 없음</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Field의 Anatomy, Properties, 배치 규칙과 실제 컴포넌트는 아직 정의하지 않았습니다. 확인되지 않은 규칙은 이 페이지에 임의로 추가하지 않습니다.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/components/input" className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/50">
              Input 확인
              <RiArrowRightLine className="size-oe-icon-xsmall" aria-hidden="true" />
            </Link>
            <Link href="/components/textarea" className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/50">
              Textarea 확인
              <RiArrowRightLine className="size-oe-icon-xsmall" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
