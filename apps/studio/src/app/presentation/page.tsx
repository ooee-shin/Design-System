import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

import { pendingTopics, presentationEntries } from "@/components/presentation-entries";

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
              무엇을, 왜, 어떻게 바꿨는지 전달합니다. 개별 수정이 아니라 설명할 수 있는 한 꼭지 단위로 기록합니다.
            </p>
          </div>
        </header>

        <ol className="flex flex-col gap-3" aria-label="변경 기록">
          {presentationEntries.map((entry) => (
            <li key={entry.id} className="rounded-2xl border bg-background p-6 sm:p-7">
              <article aria-labelledby={`${entry.id}-title`} className="flex flex-col gap-4">
                <h2 id={`${entry.id}-title`} className="text-lg font-semibold tracking-tight">
                  {entry.title}
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{entry.why}</p>
                <p className="flex max-w-3xl gap-2.5 text-sm leading-7 text-foreground">
                  <RiArrowRightLine className="mt-1.5 size-oe-icon-xsmall shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>{entry.how}</span>
                </p>
                {entry.links?.length ? (
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {entry.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            </li>
          ))}
        </ol>

        <section aria-labelledby="pending-title" className="space-y-3 border-t pt-7">
          <div>
            <h2 id="pending-title" className="text-sm font-medium">
              기록할 것
            </h2>
            <p className="mt-0.5 max-w-2xl text-xs leading-5 text-muted-foreground">
              아직 쓰지 않은 꼭지입니다. 이유는 결정을 내린 직후에 가장 잘 기억나고 시간이 지나면 결과만 남습니다.
              성격이 다른 꼭지를 늘어놓고 봐야 무엇을·왜·어떻게 형식이 전부에 맞는지도 판단할 수 있습니다.
            </p>
          </div>
          <ul className="flex flex-col rounded-2xl border bg-background">
            {pendingTopics.map((topic) => (
              <li
                key={topic.title}
                className="flex flex-col gap-1 border-b px-5 py-3.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="text-sm text-foreground">{topic.title}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{topic.source}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
