import * as React from "react"

import { NotificationBadge, type NotificationBadgeProps } from "./notification-badge"
import { cn } from "./utils"

// 모바일 화면의 맨 아래 한 줄이다. 지금 어느 화면에 있는지 알리고 다른 화면으로 옮긴다.
//
// AppHeader 와 달리 자리를 열어 두지 않고 항목 목록을 받는다. 항목의 폭이 개수에 따라 균등하게
// 나뉘어야 하고, 선택된 항목이 언제나 하나여야 하며, 아이콘과 라벨과 선택 상태가 한 덩어리로
// 움직이기 때문이다. 자리로 열어 두면 소비자가 각 항목에 선택 여부를 직접 넘기게 되어 둘이
// 동시에 켜지는 상태가 만들어진다.

// `NotificationBadgeProps` 는 점과 개수로 갈리는 union 이다. 그냥 `Omit` 을 씌우면 union 이
// 하나로 합쳐져 점에 `count` 전용 Property 를 넘길 수 있게 되므로, 각 갈래에 따로 적용한다.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type BottomNavigationItem = {
  value: string
  label: React.ReactNode
  icon: React.ReactNode
  // 공용 NotificationBadge 에 그대로 넘긴다. `count` 가 없으면 점이고 있으면 개수다.
  badge?: DistributiveOmit<NotificationBadgeProps, "className" | "render">
}

// 여섯 개부터는 라벨이 들어갈 폭이 남지 않는다. 375px 화면에서 다섯이면 항목마다 75px 이고
// 국문 다섯 자가 겨우 들어간다.
const MAX_ITEMS = 5

// 항목 영역의 높이는 56px 이며 아이콘 24px 과 라벨 14px 행간이 그 안에 들어간다. 컴포넌트가
// 실제로 차지하는 높이는 여기에 아래 여백을 더한 값이므로 56px 이 아니다.
//
// 하단 여백은 높이 바깥에 더한다. 높이 안에 넣으면 인디케이터가 있는 기기에서 항목이 그만큼
// 눌린다. 홈 인디케이터가 없는 기기에서는 `safe-area-inset-bottom` 이 0 이라 항목이 화면 맨
// 아래에 붙는데, 그 자리는 손가락이 닿기 어렵고 가장자리 제스처와도 겹친다. 그래서 안전 영역과
// 최소 16px 중 큰 값을 쓴다. 안드로이드의 제스처 핸들 영역이 그 정도라 그보다 좁으면 항목이
// 핸들과 겹친다.
const BASE_CLASS =
  "sticky bottom-0 z-10 w-full border-t border-oe-border-secondary bg-oe-background-primary pb-[max(env(safe-area-inset-bottom),1rem)]"

// 태블릿처럼 넓은 폭에서 항목이 지나치게 벌어지지 않도록 목록의 폭에 상한을 둔다. 상한을 넘는
// 폭에서는 목록이 가운데에 선다.
const LIST_CLASS = "mx-auto flex h-14 w-full max-w-[480px]"

// 항목은 내용 폭이 아니라 같은 몫을 나눠 갖는다. 내용 폭을 따르면 라벨이 긴 항목만 넓어져 누르는
// 자리가 항목마다 달라진다. `min-w-0` 이 있어야 그 몫 안에서 라벨이 잘린다.
const ITEM_CLASS =
  "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 outline-none transition-colors [&_svg]:size-6 [&_svg]:shrink-0"

// 경계가 없는 요소이므로 `interaction.md` 의 유형 3 을 쓴다. 다만 항목이 서로 붙어 있어 바깥으로
// 나간 ring 이 이웃을 침범하므로 간격 없이 안쪽으로 그린다.
const FOCUS_CLASS = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oe-focus-ring"

// 아이콘은 선택 여부와 무관하게 같은 `Fill` 하나를 그리고 색만 바뀐다. 항목이 나란히 서는
// 자리에서 시각적 위계를 잡기 위해서이며 근거는 `icon.md` 가 소유한다. 그래서 이 컴포넌트는
// ToggleButton 과 달리 아이콘을 하나만 받는다.
//
// 선택은 Brand 가 아니라 가장 진한 중립이다. 하단 내비가 알리는 것은 브랜드가 아니라 지금 어느
// 화면에 있는지이며, 그 자리에 유채색을 두면 다섯 항목 중 하나만 색을 갖는 강조로 읽힌다.
// `oe-foreground-primary` 는 Light 에서 neutral-950, Dark 에서 neutral-50 이라 두 테마 모두
// 나머지 항목과 가장 멀다.
const SELECTED_CLASS = "text-oe-foreground-primary"
const UNSELECTED_CLASS = "text-oe-foreground-tertiary"

// 선택되지 않은 항목에서 아이콘만 라벨보다 한 단계 더 낮춘다. 아이콘이 라벨과 같은 무게로 서면
// 선택되지 않은 항목이 다섯 개 나란히 있을 때 화면 아래쪽이 무거워진다.
//
// `subtle` 은 위계 줄인 primary·secondary·tertiary 를 잇는 네 번째 칸이 아니라, 그 아래가 국소적으로
// 필요한 자리에만 쓰는 이름이다. `disabled` 와 값은 같지만 그쪽은 꺼진 요소를 뜻하므로 쓸 수 없다.
const UNSELECTED_ICON_CLASS = "text-oe-foreground-subtle"

const LABEL_CLASS = "max-w-full truncate text-[11px] leading-[14px] font-medium"

// 배지는 아이콘의 오른쪽 위 모서리에 얹힌다. 위치는 NotificationBadge 가 아니라 얹는 쪽이
// 소유하므로 여기서 정한다.
//
// 고정 여백 대신 모서리를 기준으로 배지 자신의 절반만큼 밀어낸다. 점은 8px 이고 개수는 20px 을
// 넘어 폭이 두 배 넘게 차이 나는데, 같은 여백을 주면 개수 배지가 아이콘의 절반 이상을 덮는다.
// 세로는 절반을 다 밀면 항목의 위쪽 여백을 넘으므로 3분의 1만 올린다.
const BADGE_CLASS = "absolute right-0 top-0 translate-x-1/2 -translate-y-1/3"

export type BottomNavigationProps = Omit<React.ComponentPropsWithoutRef<"nav">, "onChange"> & {
  items: BottomNavigationItem[]
  value: string
  onValueChange?: (value: string) => void
}

function BottomNavigation({ className, items, value, onValueChange, ...props }: BottomNavigationProps) {
  // 조용히 잘라 내면 넘긴 항목이 화면에서 사라진 이유를 알 수 없다. 개발 중에 드러나게 한다.
  if (items.length > MAX_ITEMS) {
    throw new Error(`BottomNavigation 은 항목을 ${MAX_ITEMS} 개까지 받는다. ${items.length} 개를 넘겼다.`)
  }

  return (
    <nav data-slot="bottom-navigation" className={cn(BASE_CLASS, className)} {...props}>
      <div data-slot="bottom-navigation-list" className={LIST_CLASS}>
        {items.map((item) => {
          const selected = item.value === value

          // 선택은 컴포넌트가 스스로 바꾸지 않는다. 어느 화면에 있는지는 라우팅이 소유하므로
          // 값을 넘긴 쪽이 다음 값을 정한다.
          // 화면 이동이지 탭 전환이 아니므로 `role="tab"` 을 쓰지 않는다. 지금 어느 화면에
          // 있는지는 `aria-current` 가 전달한다.
          return (
            <button
              key={item.value}
              type="button"
              data-slot="bottom-navigation-item"
              data-value={item.value}
              aria-current={selected ? "page" : undefined}
              onClick={() => onValueChange?.(item.value)}
              className={cn(ITEM_CLASS, FOCUS_CLASS, selected ? SELECTED_CLASS : UNSELECTED_CLASS)}
            >
              <span
                data-slot="bottom-navigation-icon"
                className={cn("relative flex shrink-0 items-center", !selected && UNSELECTED_ICON_CLASS)}
              >
                {item.icon}
                {item.badge === undefined ? null : <NotificationBadge {...item.badge} className={BADGE_CLASS} />}
              </span>
              <span data-slot="bottom-navigation-label" className={LABEL_CLASS}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { BottomNavigation, MAX_ITEMS as BOTTOM_NAVIGATION_MAX_ITEMS }
