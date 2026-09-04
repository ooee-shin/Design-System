import type { ReactNode } from "react";
import Link from "next/link";
import { RiArrowLeftLine } from "@remixicon/react";

import { OnThisPage } from "@/components/component-detail-navigation";
import { presentationEntries } from "@/components/presentation-entries";

/** 본문의 `[표시할 말](경로)`을 링크로 바꾼다. 링크는 문장 안에서만 나타나고 별도 목록을 만들지 않는다. */
function withLinks(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return part;
    return (
      <Link
        key={`${match[2]}-${index}`}
        href={match[2]}
        className="text-foreground underline decoration-foreground/40 underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
      >
        {match[1]}
      </Link>
    );
  });
}

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

        {/* 컨테이너 쿼리는 조상 컨테이너를 기준으로 하므로 @container 는 그리드보다 바깥에 둔다. */}
        <div className="@container">
          <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
            <ol className="flex min-w-0 flex-col gap-3" aria-label="변경 기록">
            {presentationEntries.map((entry) => (
              <li key={entry.id} id={entry.id} className="scroll-mt-20 rounded-2xl border bg-background p-6 sm:p-8">
                <article aria-labelledby={`${entry.id}-title`}>
                  <h2 id={`${entry.id}-title`} className="text-2xl font-semibold tracking-tight">
                    {entry.title}
                  </h2>
                  {/* 제목에서 첫 칸까지를 칸 사이보다 벌린다. 같은 간격이면 제목이 소제목과 나란히 놓인 것처럼 읽힌다. */}
                  <div className="mt-8 flex flex-col gap-6">
                    {entry.sections.map((section) => (
                      <section key={section.heading}>
                        {/* 꼭지 제목과 본문 사이의 중간 위계다. 소제목이 제목과 같은 검정이면 카드 하나에 제목이 여럿 있는 것처럼 읽힌다. */}
                        <h3 className="max-w-3xl text-lg font-semibold leading-7 tracking-tight text-oe-foreground-secondary">
                          {section.heading}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{withLinks(section.body)}</p>
                      </section>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ol>

            <OnThisPage items={presentationEntries.map((entry) => ({ id: entry.id, label: entry.title }))} />
          </div>
        </div>
      </div>
    </main>
  );
}
