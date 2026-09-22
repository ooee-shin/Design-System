import Link from "next/link";
import { RiArrowLeftLine, RiFileCopyLine } from "@remixicon/react";

import { readLlmsTxt } from "@/lib/llms";

// 라우트가 `/llms` 가 아니라 `/llms-txt` 인 까닭: 정적 내보내기는 페이지마다 RSC 본문을
// `<라우트>.txt` 로 떨군다. `/llms` 이면 그 파일이 `llms.txt` 가 되어 같은 이름의 route handler
// 결과(원본 글자)를 덮는다. llms.txt 는 주소 하나로 원본이 내려와야 하는 자리라 페이지를 비켰다.
export const metadata = {
  title: "llms.txt",
  description: "AI 가 이 저장소를 처음 읽을 때 보는 색인",
};

/** `llms.txt` 의 `## 제목` 을 뽑아 목차로 쓴다. 파일이 정본이므로 목차를 따로 적지 않는다. */
function sections(source: string) {
  return [...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
}

export default function LlmsPage() {
  const source = readLlmsTxt();
  const lines = source.split("\n").length;
  const titles = sections(source);

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Home
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">llms.txt</h1>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">어떻게 쓰나</h2>
          <div className="grid gap-3 @min-[52rem]:grid-cols-3">
            {[
              {
                title: "주소 하나로 내려받는다",
                body: (
                  <>
                    <code className="rounded bg-muted px-1 py-0.5 text-[13px]">/llms.txt</code> 를 그대로 받으면 원본 글자가 나옵니다. 꾸미지 않는 것은 AI 가 읽는 자리이기 때문입니다.
                  </>
                ),
              },
              {
                title: "원본은 저장소 파일이다",
                body: (
                  <>
                    이 화면은 저장소 루트의 <code className="rounded bg-muted px-1 py-0.5 text-[13px]">llms.txt</code> 를 그대로 읽어 보여 줍니다. 복사본을 두지 않습니다 — 복사본은 반드시 원본과 어긋납니다.
                  </>
                ),
              },
              {
                title: "링크는 테스트가 지킨다",
                body: (
                  <>
                    가리키는 경로가 실제로 있는지, 확정 컴포넌트 목록이 등록과 같은지를 <code className="rounded bg-muted px-1 py-0.5 text-[13px]">pnpm check</code> 가 봅니다. 문서가 옮겨 다니는 저장소라 사람 기억으로는 못 지킵니다.
                  </>
                ),
              },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border bg-background p-4">
                <h3 className="text-sm font-medium">{card.title}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium">지금 담긴 것 — {titles.length}개 절 · {lines}줄</h2>
            <a
              href="/llms.txt"
              className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2"
            >
              <RiFileCopyLine className="size-oe-icon-xsmall" aria-hidden="true" />
              원본 열기
            </a>
          </div>
          <ol className="grid gap-1.5 @min-[40rem]:grid-cols-2">
            {titles.map((title, index) => (
              <li key={title} className="flex gap-2 rounded-lg border bg-background px-3 py-2 text-[13px]">
                <span className="tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span>{title}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">원본</h2>
          <pre className="overflow-x-auto rounded-xl border bg-background p-4 text-[13px] leading-6">
            <code>{source}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
