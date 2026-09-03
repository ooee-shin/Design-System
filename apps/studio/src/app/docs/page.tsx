import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

import { listDocs, type DocEntry } from "@/lib/docs";

const groupDescription: Record<DocEntry["group"], string> = {
  시작: "시스템 전체를 이해하는 데 먼저 읽는 문서입니다.",
  Foundations: "색상, 아이콘처럼 모든 자산이 공유하는 기반 결정입니다.",
  Components: "각 컴포넌트의 구조, Property, 상태와 사용 규칙입니다.",
  Examples: "공용 부품으로 다시 만든 실제 화면입니다.",
};

export default function DocsPage() {
  const docs = listDocs();
  const groups = ["시작", "Foundations", "Components", "Examples"] as const;

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <header className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Home
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              저장소 <code className="rounded bg-muted px-1 py-0.5 text-[13px]">docs/system</code> 문서를 그대로 표시합니다. 원본은 저장소가 소유하며 이 화면은 읽기 전용입니다.
            </p>
          </div>
        </header>

        {groups.map((group) => {
          const items = docs.filter((doc) => doc.group === group);
          if (items.length === 0) return null;

          return (
            <section key={group} aria-label={`${group} 문서`} className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">{group}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{groupDescription[group]}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    className="group flex min-h-[104px] flex-col justify-between rounded-xl border bg-background p-4 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div>
                      <h3 className="font-semibold tracking-tight">{doc.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{doc.summary}</p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                      읽기
                      <RiArrowRightLine className="size-oe-icon-xsmall transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
