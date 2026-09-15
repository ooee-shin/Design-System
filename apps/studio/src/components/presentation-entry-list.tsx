"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/candidates/tabs";
import { OnThisPage } from "@/components/component-detail-navigation";
import { presentationEntries, type PresentationKind } from "@/components/presentation-entries";

/** 탭 순서다. 컴포넌트 꼭지가 먼저 쌓였으므로 그 순서대로 둔다. */
const presentationTabs: { kind: PresentationKind; label: string }[] = [
  { kind: "component", label: "Components" },
  { kind: "screen", label: "Screens" },
];

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

/**
 * 변경 기록을 컴포넌트 꼭지와 화면 꼭지로 갈라 보여 준다.
 *
 * 배열은 하나로 두고 이 자리에서 거른다. 최신 항목이 맨 앞이라는 순서 규칙이 두 종류에 함께
 * 적용되어야, 나중에 이 배열을 다른 형식으로 뽑아낼 때 순서가 어긋나지 않기 때문이다.
 *
 * 탭을 고른 결과는 주소에 남기지 않는다. 이 화면은 주소가 하나이고 처음부터 훑어 내려가며 읽는
 * 자리여서, 특정 탭을 링크로 건네는 쓰임이 아직 없다.
 */
export function PresentationEntryList() {
  const [kind, setKind] = useState<PresentationKind>("component");
  const visibleEntries = presentationEntries.filter((entry) => entry.kind === kind);

  return (
    <Tabs
      value={kind}
      onValueChange={(value) => setKind(value as PresentationKind)}
      className="flex flex-col gap-7"
    >
      {/* 탭 줄 아래 선은 Tabs 가 긋지 않고 놓는 자리가 긋는다. 여기서는 목록과 목차를 합한
          본문 폭까지 간다. */}
      <div className="border-b border-oe-border-secondary">
        <TabsList>
          {presentationTabs.map((tab) => (
            <TabsTab key={tab.kind} value={tab.kind}>
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
      </div>

      {/* 컨테이너 쿼리는 조상 컨테이너를 기준으로 하므로 @container 는 그리드보다 바깥에 둔다. */}
      <div className="@container">
        <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
          {/* 고르지 않은 탭의 패널은 DOM 에서 빠지므로, 목차 오른쪽 칸은 활성 패널 하나와만
              나란히 선다. 숨은 카드가 목차의 활성 판정에 끼어들지도 않는다. */}
          <TabsPanel key={kind} value={kind} className="min-w-0">
            {/* 하단 여백은 OnThisPage 의 rootMargin 아래쪽 값과 같은 55vh 다. 이만큼 더 스크롤할 수 있어야
                마지막 꼭지가 활성 판정 구간까지 올라온다. 관찰 범위를 바꾸면 이 값도 함께 바꾼다. */}
            <ol className="flex min-w-0 flex-col gap-3 pb-[55vh]" aria-label="변경 기록">
              {visibleEntries.map((entry) => (
                <li key={entry.id} id={entry.id} className="scroll-mt-20 rounded-2xl border bg-background p-6 sm:p-8">
                  <article aria-labelledby={`${entry.id}-title`}>
                    <h2 id={`${entry.id}-title`} className="text-2xl font-semibold tracking-tight">
                      {entry.title}
                    </h2>
                    {/* 제목에서 첫 칸까지를 칸 사이보다 벌린다. 같은 간격이면 제목이 소제목과 나란히 놓인 것처럼 읽힌다. */}
                    <div className="relative mt-8 flex flex-col gap-6 pl-6">
                      {/* border 로는 끝을 둥글릴 수 없어 실제 막대를 그린다. absolute 라 flex 흐름과 gap 에 끼어들지 않는다. */}
                      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-oe-border-secondary/60" />
                      {entry.sections.map((section) => (
                        <section key={section.heading}>
                          {/* 꼭지 제목과 본문 사이의 중간 위계다. 소제목이 제목과 같은 검정이면 카드 하나에 제목이 여럿 있는 것처럼 읽힌다. */}
                          <h3 className="max-w-3xl text-lg font-semibold leading-7 tracking-tight text-oe-foreground-secondary">
                            {section.heading}
                          </h3>
                          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{withLinks(section.body)}</p>
                        </section>
                      ))}
                    </div>
                    {/* 소제목 없이 카드 전체에 붙는 주석이다. 좌측 선 안에 두면 네 번째 칸처럼 읽히므로 바깥에 둔다. */}
                    {entry.caption ? (
                      <p className="mt-6 flex max-w-3xl gap-0.5 pl-6 text-xs leading-5 text-oe-foreground-tertiary">
                        {/* 칸 묶음과 같은 24px 을 들여써서 별표가 소제목·본문과 같은 지점에서 시작한다. */}
                        <span aria-hidden="true">*</span>
                        <span>{withLinks(entry.caption)}</span>
                      </p>
                    ) : null}
                  </article>
                </li>
              ))}
            </ol>
          </TabsPanel>

          <OnThisPage items={visibleEntries.map((entry) => ({ id: entry.id, label: entry.title }))} />
        </div>
      </div>
    </Tabs>
  );
}
