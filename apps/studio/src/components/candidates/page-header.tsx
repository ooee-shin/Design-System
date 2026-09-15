"use client"

import * as React from "react"

import {
  RiArrowRightSLine,
  RiInformationLine,
  RiStarFill,
  RiStarLine,
} from "@remixicon/react"

import { Button, ToggleButton } from "@ooee/ui"

import { TabsList, TabsTab } from "@/components/candidates/tabs"

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
 * 탭 줄 자체는 `tabs.tsx` 가 갖는다. **탭을 쓸 때는 쓰는 쪽이 `Tabs` 로 이 부품과 본문을 함께
 * 감싼다.** 탭 줄과 그 탭이 여는 내용은 서로를 가리켜야 하는데, 내용은 이 부품의 바깥에 있기
 * 때문이다.
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
  favorite,
  onFavoriteChange,
  description,
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
  /** 이 화면이 즐겨찾기에 담겨 있는지. 넘기지 않으면 별이 서지 않는다. */
  favorite?: boolean
  onFavoriteChange?: (next: boolean) => void
  /**
   * 이 화면이 무엇을 하는 자리인지. 넘기지 않으면 경로 끝에 설명 아이콘이 서지 않는다.
   *
   * **아직 이 글이 어디에도 그려지지 않는다.** 누르면 펼쳐지는 자리는 뒤에 붙이기로 하고
   * 지금은 아이콘만 세워 둔 상태다.
   */
  description?: React.ReactNode
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
          누를 곳이 아니므로 링크가 아니다. 앞선 항목들도 아직 실제 경로가 없어 글자로만 둔다.
          설명은 그 마지막 항목 바로 뒤에 선다. 지금 화면의 이름이 나오는 자리이고, 설명은 그
          이름을 보충하는 글이기 때문이다. */}
      <div className="flex items-center">
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
        {/* 누르면 이 화면이 무엇을 하는 자리인지 펼쳐진다. 펼칠 내용은 아직 붙이지 않았고
            자리만 잡아 두었다.

            글자색은 버튼이 주는 `neutral-800` 대신 경로 글자와 같은 옅은 값을 얹었다. 이 줄의
            어느 것도 먼저 읽혀야 하는 것이 아니기 때문이다. 가리키면 버튼이 가진 색으로
            진해진다.

            버튼은 28px 이고 경로 글자 줄은 16px 이다. 그대로 두면 이 줄만 12px 높아져 제목이
            함께 밀리므로, 넘치는 만큼을 위아래로 덜어 내어 줄 높이를 글자에 맞춰 둔다. */}
        {description === undefined ? null : (
          <Button
            variant="ghost"
            tone="neutral"
            controlSize="xsmall"
            aria-label={`${title} 설명`}
            leadingIcon={<RiInformationLine />}
            className="-my-1.5 text-oe-foreground-tertiary"
          />
        )}
      </div>

      {/* 제목과 동작 버튼은 한 줄에서 좌우로 갈린다. 버튼이 여럿이면 제목 쪽이 먼저 줄어든다. */}
      <div className="mt-1.5 flex items-start justify-between gap-4">
        {/* 별은 제목 옆에 붙는다. 이 화면이 다루는 대상을 바꾸는 오른쪽 버튼들과 달리, 이
            화면 자체를 각자 담아 두는 표시이기 때문이다. */}
        <div className="flex min-w-0 items-center gap-0.5">
          <h1 className="min-w-0 text-2xl leading-8 font-semibold tracking-tight text-oe-foreground-primary">
            {title}
          </h1>
          {favorite === undefined ? null : (
            // 이름은 켜짐과 꺼짐에서 같은 것을 쓴다. 지금 담겨 있는지는 `aria-pressed` 가 이미
            // 말하므로, 이름까지 바꾸면 상태와 누르면 일어날 일이 뒤섞인다.
            <ToggleButton
              variant="ghost"
              tone="custom"
              color="favorite"
              controlSize="small"
              icon={<RiStarLine />}
              activeIcon={<RiStarFill />}
              pressed={favorite}
              onPressedChange={onFavoriteChange}
              aria-label="즐겨찾기"
            />
          )}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {tabs ? (
        <TabsList className="mt-4">
          {tabs.map((tab) => (
            <TabsTab key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
      ) : null}
    </div>
  )
}
