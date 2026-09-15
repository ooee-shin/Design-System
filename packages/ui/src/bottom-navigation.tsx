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
  /** 선택되었을 때만 쓰는 아이콘이다. 주지 않으면 `icon` 하나를 선택 여부와 무관하게 쓴다. */
  selectedIcon?: React.ReactNode
  // 공용 NotificationBadge 에 그대로 넘긴다. `count` 가 없으면 점이고 있으면 개수다.
  badge?: DistributiveOmit<NotificationBadgeProps, "className" | "render">
}

// 여섯 개부터는 라벨이 들어갈 폭이 남지 않는다. 375px 화면에서 다섯이면 항목마다 75px 이고
// 국문 다섯 자가 겨우 들어간다.
const MAX_ITEMS = 5

// 항목 영역의 높이는 라벨을 감췄을 때가 56px 이고 라벨이 있으면 68px 이다. 56px 은 아이콘 24px 을
// 사방 16px 이 감싸는 높이다. 라벨이 있으면 아이콘 24px, 간격 8px, 라벨 16px 로 48px 을 쓰고 위아래로
// 10px 씩 남는다. 선택 표시가 아이콘보다 위아래로 6px 씩 크므로 표시와 위쪽 선 사이에 4px 이
// 남는다. 이 값이 더 좁으면 표시가 선에 닿은 것으로 보인다. 컴포넌트가
// 실제로 차지하는 높이는 여기에 아래 여백을 더한 값이므로 56px 이 아니다.
//
// 하단 여백은 높이 바깥에 더한다. 높이 안에 넣으면 인디케이터가 있는 기기에서 항목이 그만큼
// 눌린다. 홈 인디케이터가 없는 기기에서는 `safe-area-inset-bottom` 이 0 이라 항목이 화면 맨
// 아래에 붙는데, 그 자리는 손가락이 닿기 어렵고 가장자리 제스처와도 겹친다. 그래서 안전 영역과
// 최소 16px 중 큰 값을 쓴다. 안드로이드의 제스처 핸들 영역이 그 정도라 그보다 좁으면 항목이
// 핸들과 겹친다.
// 붙어 있는 자리는 형태마다 다르다. 붙어 있는 동안의 위치와 스크롤이 끝났을 때의 제자리가 어긋나면
// 마지막에 줄이 한 번 튄다. 두 값을 같게 맞춘다.
const BASE_CLASS = "sticky z-10 bg-oe-background-primary"

// 형태는 둘이다. `bar` 는 화면 바닥에 붙어 폭을 다 쓰고 위쪽에 경계선을 둔다. `floating` 은 좌우에
// 여백을 두고 떠서 알약으로 서며, 경계선 없이 그림자만으로 본문과 갈린다. 떠 있는 쪽은 아래로도
// 12px 을 더 띄운다. 바닥에 붙지 않으므로 안전 영역만으로는 떠 보이지 않는다.
const VARIANT_CLASS = {
  // 바닥에 붙는 줄은 아래 여백을 자기 안쪽에 갖는다. 바닥까지가 줄의 면이어야 그 아래로 다른 것이
  // 비치지 않는다.
  //
  // 위쪽 선은 본문과 줄을 가르기만 하면 되므로 `oe-border-secondary`(neutral-200) 보다 한 단계
  // 옅다. 경계 token 에는 그 아래가 없다. `oe-border-disabled` 가 값은 같지만 꺼진 요소를 뜻하므로
  // 쓸 수 없어서, 그 자리에 놓일 token 이 정해지기 전까지 프리미티브를 직접 쓴다.
  bar: "sticky bottom-0 w-full border-t border-neutral-100 dark:border-neutral-900 pb-[max(env(safe-area-inset-bottom),1rem)]",
  // 떠 있는 알약은 같은 여백을 바깥으로 내보낸다. 안쪽에 두면 알약이 그만큼 높아져서, 라벨을 감춰
  // 줄을 낮춰도 흰 면은 줄어들지 않는다.
  //
  // 좌우는 화면의 기본 여백인 16px 보다 한 단계 좁은 12px 이다. 끝이 둥글어서 같은 값을 주면
  // 본문보다 더 물러선 것으로 보인다.
  // 아래 여백과 붙어 있는 자리의 값이 같아야 한다. 아래 두 값은 언제나 함께 고친다.
  floating:
    "bottom-[calc(max(env(safe-area-inset-bottom),0px)+0.75rem)] mx-3 mb-[calc(max(env(safe-area-inset-bottom),0px)+0.75rem)] rounded-full shadow-sm",
} as const

// 태블릿처럼 넓은 폭에서 항목이 지나치게 벌어지지 않도록 목록의 폭에 상한을 둔다. 상한을 넘는
// 폭에서는 목록이 가운데에 선다.
// 선택 표시가 이 안에서 자리를 옮기므로 기준점을 여기에 둔다. 없으면 표시가 내비게이션 전체를
// 기준으로 서서 아래 여백만큼 내려간다.
const LIST_CLASS = "relative flex w-full"

// 떠 있는 형태에서는 항목이 알약 안에 들어가므로 가장자리에 8px 을 남긴다. 그러지 않으면 선택
// 표시가 알약의 둥근 모서리를 넘는다. 위아래와 좌우가 같은 값이어야 표시가 알약 안에서 한가운데
// 놓인 것으로 보인다.
//
// 줄 높이는 선택 표시가 필요한 크기에 이 여백을 더한 값이다. 라벨을 감추면 표시가 48px 이므로
// 64px, 라벨이 있으면 56px 이므로 72px 이다. 라벨을 감추면 줄이 8px 낮아진다. 글자가 빠진 만큼 높이가 남으면 아이콘만 있는 알약이 속 빈
// 상자로 보인다. 높이가 끊기지 않고 바뀌도록 전환을 함께 건다.
const FLOATING_LIST_CLASS = "px-2 transition-[height] duration-200 ease-out"

// 두 형태 모두 라벨을 켜고 끌 때 높이가 끊기지 않고 바뀐다.
const BAR_LIST_CLASS = "transition-[height] duration-200 ease-out"

// 선택 표시는 항목마다 켜졌다 꺼지지 않고 하나가 자리를 옮긴다. 어디에서 어디로 갔는지가 움직임
// 자체로 읽힌다. 움직임을 줄이도록 설정한 기기에서는 전환 없이 곧바로 자리를 잡는다.
//
// 사방으로 8px 씩 물러선다. 라벨을 감춘 64px 줄에서 48px, 라벨이 있는 72px 줄에서 56px 로 선다.
// 아이콘 24px 을 넉넉히 감싸는 크기이며, 이보다 작으면 표시가 아이콘에 붙어 눌린 자국처럼 보인다.
const INDICATOR_MOTION_CLASS =
  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

// 바닥에 붙는 줄에서는 표시가 아이콘만 감싸고 라벨은 밖에 남는다. 라벨까지 덮으면 줄 전체가
// 알약으로 채워져 떠 있는 형태와 구분되지 않는다.
//
// 표시는 항목과 같은 세로 배치를 그대로 따라가고, 아이콘 자리에 40×36 을, 라벨 자리에 같은 높이의
// 빈 칸을 둔다. 아이콘 24px 을 좌우 8px, 위아래 6px 로 감싼 크기다. 위아래를 좌우보다 좁게 두는
// 것은 그 방향으로 라벨이 붙기 때문이며, 가로로 더 늘이지 않아 아이콘이 차지하는 만큼만 덮는다.
// 모서리는 알약이 아니라 한 단계 낮춘 값이라 라벨과 함께 놓였을 때 아이콘의 자리로 읽힌다.
//
// 아이콘보다 12px 높으므로 위아래로 6px 씩 당겨 아이콘과 같은 24px 만 차지하게 한다. 그래야 두
// 세로 배치의 가운데가 맞는다.
const BAR_INDICATOR_CLASS = "pointer-events-none absolute inset-y-0 left-0 z-0 flex flex-col items-center justify-center gap-2"

const INDICATOR_CLASS =
  cn(
    "pointer-events-none absolute inset-y-2 left-2 z-0 rounded-full bg-oe-background-secondary",
    INDICATOR_MOTION_CLASS,
  )

// 누르는 동안 아이콘이 작아졌다가 손을 떼면 돌아온다. 선택된 아이콘은 조금 커진 채로 머문다.
const PRESSED_ICON_CLASS = "transition-transform duration-200 ease-out group-active/item:scale-90"

// 항목은 내용 폭이 아니라 같은 몫을 나눠 갖는다. 내용 폭을 따르면 라벨이 긴 항목만 넓어져 누르는
// 자리가 항목마다 달라진다. `min-w-0` 이 있어야 그 몫 안에서 라벨이 잘린다.
const ITEM_CLASS =
  "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center outline-none transition-colors [&_svg]:size-6 [&_svg]:shrink-0"

// 초점선은 두 형태 모두 항목의 네모가 아니라 선택 표시와 같은 자리에 그린다. 경계가 없는 요소라
// `interaction.md` 의 유형 3 을 쓰되, 항목이 서로 붙어 있어 바깥으로 나간 ring 이 이웃을 침범하므로
// 표시 안쪽에 그린다.
//
// 바닥에 붙는 줄에서는 초점선을 아이콘 자리에 그린다. 항목의 네모 전체를 두르면 라벨까지 묶여
// 선택 표시와 다른 모양이 되고, 항목이 서로 붙어 있어 선이 이웃과 맞닿는다. 선택 표시와 같은
// 40×36 을 아이콘 한가운데에 겹쳐 두어 무엇이 켜질 자리인지 그대로 읽히게 한다.
const BAR_FOCUS_ICON_CLASS =
  "before:pointer-events-none before:absolute before:left-1/2 before:top-1/2 before:h-9 before:w-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-xl before:content-[''] group-focus-visible/item:before:ring-2 group-focus-visible/item:before:ring-oe-focus-ring"

// 떠 있는 형태에서는 항목의 네모 전체에 그리지 않는다. 둥근 알약 안에 네모난 선이 서면 모양이
// 어긋나고, 항목이 줄 높이를 다 쓰므로 선이 알약의 위아래 가장자리에 닿는다. 선택 표시와 같은
// 자리에 같은 모양으로 그려서 무엇이 켜질 자리인지 그대로 읽히게 한다. 누르는 자리는 그대로
// 항목 전체이므로 손가락이 닿는 넓이는 줄지 않는다.
const FLOATING_FOCUS_CLASS =
  "after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-2 after:rounded-full after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-oe-focus-ring"

// 아이콘은 선택 여부와 무관하게 같은 `Fill` 하나를 그리고 색만 바뀐다. 항목이 나란히 서는
// 자리에서 시각적 위계를 잡기 위해서이며 근거는 `icon.md` 가 소유한다. 그래서 이 컴포넌트는
// ToggleButton 과 달리 아이콘을 하나만 받는다.
//
// 선택은 Brand 가 아니라 가장 진한 중립이다. 하단 내비가 알리는 것은 브랜드가 아니라 지금 어느
// 화면에 있는지이며, 그 자리에 유채색을 두면 다섯 항목 중 하나만 색을 갖는 강조로 읽힌다.
// `oe-foreground-primary` 는 Light 에서 neutral-950, Dark 에서 neutral-50 이라 두 테마 모두
// 나머지 항목과 가장 멀다.
const SELECTED_CLASS = "text-oe-foreground-primary"
const UNSELECTED_CLASS = "text-oe-foreground-subtle"

// 선택되지 않은 항목은 아이콘과 라벨이 같은 색이다. 둘을 갈라 놓으면 아이콘이 먼저 사라지면서
// 항목이 무엇인지 알아보기 어려워진다.
//
// `subtle` 은 위계 줄인 primary·secondary·tertiary 를 잇는 네 번째 칸이 아니라, 그 아래가 국소적으로
// 필요한 자리에만 쓰는 이름이다. `disabled` 와 값은 같지만 그쪽은 꺼진 요소를 뜻하므로 쓸 수 없다.
const UNSELECTED_ICON_CLASS = "text-oe-foreground-subtle"

const LABEL_CLASS = "text-oe-label max-w-full truncate font-medium"

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
  /** 아이콘 아래에 글자를 함께 보인다. 끄면 글자만 감추고 항목의 이름은 남는다. */
  showLabels?: boolean
  /** 화면 바닥에 붙는 줄인지, 좌우에 여백을 두고 떠 있는 알약인지. */
  variant?: BottomNavigationVariant
}

export type BottomNavigationVariant = keyof typeof VARIANT_CLASS

function BottomNavigation({ className, items, value, onValueChange, showLabels = false, variant = "bar", ...props }: BottomNavigationProps) {
  // 조용히 잘라 내면 넘긴 항목이 화면에서 사라진 이유를 알 수 없다. 개발 중에 드러나게 한다.
  if (items.length > MAX_ITEMS) {
    throw new Error(`BottomNavigation 은 항목을 ${MAX_ITEMS} 개까지 받는다. ${items.length} 개를 넘겼다.`)
  }

  const selectedIndex = items.findIndex((item) => item.value === value)

  return (
    <nav data-slot="bottom-navigation" data-variant={variant} className={cn(BASE_CLASS, VARIANT_CLASS[variant], className)} {...props}>
      <div
        data-slot="bottom-navigation-list"
        className={cn(
          LIST_CLASS,
          variant === "floating"
              ? [FLOATING_LIST_CLASS, showLabels ? "h-18" : "h-16"]
              : [BAR_LIST_CLASS, showLabels ? "h-17" : "h-14"],
        )}
      >
        {selectedIndex < 0 ? null : variant === "floating" ? (
          <span
            data-slot="bottom-navigation-indicator"
            aria-hidden="true"
            className={INDICATOR_CLASS}
            style={{
              width: `calc((100% - 1rem) / ${items.length})`,
              transform: `translateX(${selectedIndex * 100}%)`,
            }}
          />
        ) : (
          <span
            data-slot="bottom-navigation-indicator"
            aria-hidden="true"
            className={cn(BAR_INDICATOR_CLASS, INDICATOR_MOTION_CLASS)}
            style={{ width: `calc(100% / ${items.length})`, transform: `translateX(${selectedIndex * 100}%)` }}
          >
            <span className="-my-1.5 h-9 w-10 rounded-xl bg-oe-background-secondary" />
            {showLabels ? <span className="h-4" /> : null}
          </span>
        )}
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
              className={cn(
                ITEM_CLASS,
                variant === "floating" && FLOATING_FOCUS_CLASS,
                selected ? SELECTED_CLASS : UNSELECTED_CLASS,
                // 선택 배경은 항목이 아니라 자리를 옮기는 표시 하나가 갖는다. 항목은 그 위에 선다.
                "group/item relative z-[1]",
                // 아이콘과 라벨 사이다. 바닥에 붙는 줄에서는 선택 표시가 아이콘보다 아래로 더
                // 내려오므로, 그 값보다 넓어야 표시가 라벨에 닿지 않는다.
                variant === "floating" ? "gap-1" : "gap-2",
              )}
            >
              <span
                data-slot="bottom-navigation-icon"
                className={cn(
                  "relative flex shrink-0 items-center",
                  !selected && UNSELECTED_ICON_CLASS,
                  PRESSED_ICON_CLASS,
                  selected && "scale-105",
                  variant === "floating" ? undefined : BAR_FOCUS_ICON_CLASS,
                )}
              >
                {selected && item.selectedIcon !== undefined ? item.selectedIcon : item.icon}
                {item.badge === undefined ? null : <NotificationBadge {...item.badge} className={BADGE_CLASS} />}
              </span>
              {/* 글자를 감출 때도 지우지 않는다. 지우면 항목에 이름이 없어져 화면 낭독기가
                  다섯 개를 모두 「버튼」으로만 읽는다. */}
              <span data-slot="bottom-navigation-label" className={showLabels ? LABEL_CLASS : "sr-only"}>
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
