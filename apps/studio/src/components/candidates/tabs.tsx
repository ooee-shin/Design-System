"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

/**
 * 한 자리에서 내용을 갈아 끼우는 탭이다. 고른 탭 아래에 밑줄이 서고, 다른 탭을 고르면 그 자리로
 * 미끄러진다.
 *
 * 얼개는 VibePrompt 의 「Sliding underline tabs」에서 가져왔다. 출처는 `sources.md` 가 갖는다.
 * 받은 코드는 고른 탭의 좌표와 너비를 JavaScript 로 재어 밑줄에 옮겨 적는데, Base UI 의
 * `Tabs.Indicator` 가 같은 값을 CSS 변수로 내어 주므로 그것을 읽어 쓴다.
 *
 * **탭 줄 아래 선은 이 컴포넌트가 긋지 않는다.** 그 선이 어디에서 시작해 어디까지 가는지는 탭을
 * 놓는 자리가 정하기 때문이다. 화면의 머리에서는 좌우 끝까지 가고, 본문 안에서는 그 상자의
 * 폭까지만 간다. 이 컴포넌트는 그 선 위에 밑줄을 얹는 일만 한다.
 */
function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn(className)} {...props} />
}

function TabsList({ className, children, ...props }: TabsPrimitive.List.Props) {
  return (
    // 탭이 좌우로 4px 씩 내어 주므로 줄 전체를 그만큼 왼쪽으로 당긴다. 그러지 않으면 첫 탭의
    // 글자가 그 4px 만큼 안으로 들어가 위아래 요소와 시작점이 어긋난다. 사이 간격도 그 8px 을
    // 빼고 두어, 글자와 글자 사이가 28px 로 남게 한다.
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("relative -ml-1 flex gap-5", className)}
      {...props}
    >
      {children}
      {/* 밑줄은 이 줄 아래 선과 겹치도록 1px 을 내려 앉는다. 색은 면을 채우는 값이 아니라 선을
          긋는 값이다. 버튼이 쓰는 짙은 단계로 두면 2px 짜리 선이 검게 읽힌다. */}
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        renderBeforeHydration
        className="absolute -bottom-px left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] rounded-full bg-oe-brand-border-primary transition-[left,width] duration-200 ease-out"
      />
    </TabsPrimitive.List>
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    // 글자 폭에 딱 맞추면 밑줄이 글자에 붙어 시작하고 끝난다. 좌우로 4px 씩 내어 주어 밑줄이
    // 글자를 조금 넘어서게 둔다. 누를 수 있는 자리도 그만큼 넓어진다.
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "cursor-pointer rounded-t-sm px-1 pb-3 text-sm text-oe-foreground-tertiary transition-colors duration-150 outline-none hover:text-oe-foreground-secondary focus-visible:ring-2 focus-visible:ring-oe-focus-ring data-active:font-medium data-active:text-oe-foreground-primary",
        className,
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-panel" className={cn(className)} {...props} />
}

export { Tabs, TabsList, TabsPanel, TabsTab }
