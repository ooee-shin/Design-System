import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "./utils"

export type NotificationBadgeTone = "accent" | "neutral"

// `max` 는 붙는 자리가 정한다. 아이콘 모서리처럼 좁은 자리는 99, 목록 행처럼 넓은 자리는 999 다.
// 값을 둘로 제한해 표시 폭이 세 글자와 네 글자로 고정되게 하며, 다른 자리가 생기면 넓힌다.
export type NotificationBadgeMax = 99 | 999

// tone 은 둘이며 Badge 와 같은 프리미티브 단계 규칙을 쓴다. 채운 형태만 있으므로 배경은 600 단계
// 하나이고 글자는 white 다. semantic token 을 쓰지 않는 이유는 `oe-accent-background-bold-primary`
// 가 Dark 에서 red-400 으로 뒤집혀 white 글자의 대비가 무너지기 때문이다. 근거는 badge.md 의 「색」.
const TONE_CLASS: Record<NotificationBadgeTone, string> = {
  accent: "bg-red-600",
  neutral: "bg-neutral-600",
}

// 붙는 위치는 화면 코드가 정한다. host 를 감싸는 구조를 컴포넌트가 들고 있으면 쓰려는 자리의
// Layout 을 건드리게 되므로, 여기서는 모양만 소유하고 위치는 `className` 으로 받는다.
//
// 개수 형태의 높이 18px 은 12px 글자 상자 14px 에 위아래 2px 을 더한 값이다. 16px 에서는 상하
// 여백이 1px 씩이어서 글자가 위아래로 꽉 차 보였다. 한 자리 수에서도 원을 유지하도록 `min-w` 를
// 같은 값으로 둔다.
//
// 수는 `tabular-nums` 를 쓰지 않는다. 등폭 숫자는 열로 늘어놓은 수의 자리를 맞추는 장치인데 이
// 표시에는 열이 없고, 자릿수가 바뀌면 폭이 어차피 달라진다. 대신 `1` 의 advance 가 `3` 과 같은
// 7.5px 로 넓어져 `19` 처럼 섞인 수에서 자간이 벌어져 보인다. 비율 숫자에서 `1` 은 5.4px 다.
// 같은 자릿수에서 폭이 최대 2px 흔들리는 것은 감수한다. 얹힌 자리가 절대 좌표로 고정되어 있어
// 눈에 띄지 않고, 치우쳐 보이는 것은 정지 상태에서 계속 남기 때문이다.
const BASE_CLASS = "inline-flex shrink-0 items-center justify-center rounded-full text-white"

// 아이콘이나 버튼 위에 얹히면 경계가 host 와 붙어 표시가 떨어져 보이지 않는다. 배경색과 같은
// 2px 링이 그 자리를 벌린다. 겹치지 않는 자리에서는 필요 없으므로 끌 수 있다.
const STROKE_CLASS = "ring-2 ring-oe-background-primary"

// 점은 「처리할 것이 있다」만 말하는 자리이고 색으로 뜻을 나눌 여지가 없어 accent 로 고정한다.
// `max` 도 수를 보이지 않는 형태에서는 뜻이 없다. 그래서 두 prop 을 개수 형태에서만 받도록 타입을
// 갈라, 점에 함께 넘기면 걸리게 둔다. 내용은 `count` 가 정하므로 `children` 은 받지 않는다.
type NotificationBadgeShapeProps =
  | { count?: undefined; tone?: never; max?: never }
  | { count: number; tone?: NotificationBadgeTone; max?: NotificationBadgeMax }

export type NotificationBadgeProps = Omit<useRender.ComponentProps<"span">, "children"> & {
  stroke?: boolean
} & NotificationBadgeShapeProps

// 모양을 그리는 쪽은 두 형태를 한 함수에서 다루므로 갈라 둔 타입을 합친 형태로 받는다.
type NotificationBadgeShapeInternalProps = Omit<useRender.ComponentProps<"span">, "children"> & {
  count?: number
  max?: NotificationBadgeMax
  tone?: NotificationBadgeTone
  stroke?: boolean
}

// 읽지 않은 것이 없으면 표시할 이유가 없다. 컴포넌트가 이 경우를 담당하면 화면 코드가 매번
// `unread > 0 &&` 을 쓰지 않는다. `useRender` 가 hook 이므로 조건을 이 껍데기에서 처리해
// hook 호출 순서가 갈리지 않게 한다.
function NotificationBadge(props: NotificationBadgeProps) {
  if (props.count !== undefined && props.count <= 0) return null

  return <NotificationBadgeShape {...props} />
}

function NotificationBadgeShape({ className, count, max = 99, tone = "accent", stroke = true, render, ...props }: NotificationBadgeShapeInternalProps) {
  const shape = count === undefined ? "dot" : "count"

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          BASE_CLASS,
          shape === "dot" ? "size-2" : "h-[18px] min-w-[18px] px-1 text-xs font-medium leading-none",
          TONE_CLASS[tone],
          stroke && STROKE_CLASS,
          className,
        ),
        children: count === undefined ? undefined : count > max ? `${max}+` : String(count),
        // Figma 카탈로그가 이 넷으로 Variant 를 가른다. 넘침은 표시 문자열에서도 읽히지만
        // `max` 를 바꾸면 그 규칙이 깨지므로 값을 그대로 남긴다.
        //
        // `mergeProps` 의 첫 인자 타입은 `data-*` 를 모른다. 이 컴포넌트는 `useRender` 로 태그를
        // 갈아 끼울 수 있어 span 의 속성으로 좁혀져 있기 때문이며, 넘기는 값 자체는 문자열이라
        // 런타임에 달라지는 것이 없다.
        ...({
          "data-slot": "notification-badge",
          "data-shape": shape,
          "data-tone": tone,
          "data-overflow": count === undefined || count <= max ? "아님" : `${max}+`,
        } as React.HTMLAttributes<HTMLSpanElement>),
      },
      props,
    ),
    render,
    state: {
      slot: "notification-badge",
      shape,
      tone,
    },
  })
}

export { NotificationBadge }
