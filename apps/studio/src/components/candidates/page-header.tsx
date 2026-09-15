"use client"

import * as React from "react"

import { Tabs } from "@base-ui/react/tabs"
import { RiArrowRightSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

/**
 * 본문의 머리다. 헤더와 좌측 메뉴를 뺀 자리의 맨 위에 서며, 지금 보고 있는 화면이 무엇이고 그
 * 화면이 어디에 있는지를 말한다.
 *
 * 얼개는 VibePrompt 의 두 화면에서 가져왔다. 출처는 `sources.md` 가 갖는다. 경로와 제목, 오른쪽
 * 동작 버튼의 자리는 「Breadcrumb page header」에서, 밑줄이 고른 탭을 따라 미끄러지는 탭 줄은
 * 「Sliding underline tabs」에서 본 것이다.
 *
 * 받은 코드가 소유자·생성일·식별자를 제목 아래에 함께 그리는 것은 들이지 않았다. 그 값들은 상세
 * 화면이 갖는 것이고, 이 부품은 각 메뉴의 첫 화면이 공통으로 쓰는 자리이기 때문이다.
 *
 * 탭과 동작 버튼은 둘 다 없어도 된다. 없으면 그 줄이 통째로 서지 않는다.
 *
 * **탭을 쓸 때는 쓰는 쪽이 `Tabs.Root` 로 이 부품과 본문을 함께 감싼다.** 탭 줄과 그 탭이 여는
 * 내용은 서로를 가리켜야 하는데, 내용은 이 부품의 바깥에 있기 때문이다.
 */
export type PageHeaderTab = {
  value: string
  label: string
}

export function PageHeader({
  path,
  title,
  tabs,
  actions,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** 첫 화면부터 지금 화면까지의 경로. 마지막 항목이 지금 보고 있는 화면이다. */
  path: string[]
  title: string
  /** 화면 안을 가르는 탭. 없으면 탭 줄이 서지 않는다. */
  tabs?: PageHeaderTab[]
  /** 제목 오른쪽에 서는 동작 버튼. 없으면 제목이 그 자리까지 쓴다. */
  actions?: React.ReactNode
}) {
  const current = path.length - 1

  return (
    <div
      className={cn(
        // 본문이 스크롤되어도 이 자리는 줄어들지 않는다. 좌우 여백은 본문과 같은 24px 이다.
        // 탭이 있으면 탭의 밑줄이 아래 경계선 자리에 겹쳐야 하므로 아래 여백을 두지 않는다.
        "shrink-0 border-b border-oe-border-secondary bg-oe-background-primary px-6 pt-4",
        tabs ? "pb-0" : "pb-5",
        className,
      )}
      {...props}
    >
      {/* 경로는 제목보다 먼저 읽히고, 제목보다 작고 옅다. 마지막 항목은 지금 보고 있는 화면이라
          누를 곳이 아니므로 링크가 아니다. 앞선 항목들도 아직 실제 경로가 없어 글자로만 둔다. */}
      <nav aria-label="현재 위치">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-oe-foreground-tertiary">
          {path.map((step, index) => (
            <li key={step} className="flex items-center gap-1">
              {index > 0 ? (
                <RiArrowRightSLine
                  className="size-3.5 shrink-0 text-oe-foreground-subtle"
                  aria-hidden="true"
                />
              ) : null}
              <span
                aria-current={index === current ? "page" : undefined}
                className={index === current ? "text-oe-foreground-secondary" : undefined}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* 제목과 동작 버튼은 한 줄에서 좌우로 갈린다. 버튼이 여럿이면 제목 쪽이 먼저 줄어든다. */}
      <div className="mt-1.5 flex items-start justify-between gap-4">
        <h1 className="text-2xl leading-8 font-semibold tracking-tight text-oe-foreground-primary">
          {title}
        </h1>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {tabs ? (
        // 밑줄은 고른 탭의 왼쪽 끝과 너비를 그대로 받아 그 자리로 미끄러진다. 좌표를 직접 재지
        // 않는 이유는 Base UI 의 Indicator 가 그 값을 CSS 변수로 내어 주기 때문이다.
        // 탭이 좌우로 4px 씩 내어 준 만큼 줄 전체를 왼쪽으로 당긴다. 그러지 않으면 첫 탭의 글자
        // 시작점이 제목보다 4px 안으로 들어간다. 사이 간격도 그 8px 만큼 줄여, 글자와 글자
        // 사이는 그대로 28px 로 둔다.
        <Tabs.List className="relative -ml-1 mt-4 flex gap-5">
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              // 글자 폭에 딱 맞추면 밑줄이 글자에 붙어 시작하고 끝난다. 좌우로 4px 씩 내어 주어
              // 밑줄이 글자를 조금 넘어서게 둔다. 누를 수 있는 자리도 그만큼 넓어진다.
              className="cursor-pointer rounded-t-sm px-1 pb-3 text-sm text-oe-foreground-tertiary transition-colors duration-150 outline-none hover:text-oe-foreground-secondary focus-visible:ring-2 focus-visible:ring-oe-focus-ring data-active:font-medium data-active:text-oe-foreground-primary"
            >
              {tab.label}
            </Tabs.Tab>
          ))}
          {/* 아래 경계선 위에 겹쳐 앉아 그 자리를 브랜드 색으로 덮는다. 색은 면을 채우는 값이
              아니라 선을 긋는 값이다. 버튼이 쓰는 짙은 단계로 두면 2px 짜리 선이 검게 읽힌다. */}
          <Tabs.Indicator
            renderBeforeHydration
            className="absolute -bottom-px left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] rounded-full bg-oe-brand-border-primary transition-[left,width] duration-200 ease-out"
          />
        </Tabs.List>
      ) : null}
    </div>
  )
}
