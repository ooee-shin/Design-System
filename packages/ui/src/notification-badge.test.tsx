import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { NotificationBadge } from "./notification-badge"

afterEach(() => {
  cleanup()
})

function badgeIn(container: HTMLElement) {
  return container.querySelector("[data-slot=notification-badge]")
}

// tone 은 둘이며 Badge 와 같은 프리미티브 단계 규칙을 쓴다. 채운 형태만 있으므로 배경은 600
// 단계 하나이고 글자는 white 다. semantic token 대신 단계를 참조하는 이유는 badge.md 의 「색」과
// 같다. `oe-accent-background-bold-primary` 는 Dark 에서 red-400 으로 뒤집혀 white 글자의 대비가
// 무너지므로 쓰지 않는다.
const TONE_CLASS = {
  accent: "bg-red-600",
  neutral: "bg-neutral-600",
} as const

// 알림 표시는 아이콘이나 버튼 위에 얹히는 자리가 대부분이다. 두 형태 모두 8px 과 16px 로 작아서
// 크기 단계를 두지 않고 하나로 시작한다.
test("a notification badge without a count is an 8px dot", () => {
  const badge = badgeIn(render(<NotificationBadge />).container)
  const className = badge?.className ?? ""

  assert.ok(className.includes("size-2"), `8px 가 아니다: ${className}`)
  assert.ok(className.includes("rounded-full"), `원이 아니다: ${className}`)
  assert.equal(badge?.textContent, "", `점에 글자가 있다: ${badge?.textContent}`)
})

// 높이 18px 은 12px 글자 상자 14px 에 위아래 2px 을 더한 값이다. 16px 에서는 상하 여백이 1px 씩
// 이어서 글자가 위아래로 꽉 차 보였다.
test("a notification badge with a count is an 18px pill", () => {
  const badge = badgeIn(render(<NotificationBadge count={12} />).container)
  const className = badge?.className ?? ""

  assert.ok(className.includes("h-[18px]"), `18px 가 아니다: ${className}`)
  assert.ok(className.includes("min-w-[18px]"), `한 자리 수에서 원이 되지 않는다: ${className}`)
  assert.ok(className.includes("px-1"), `좌우 여백이 4px 이 아니다: ${className}`)
  assert.ok(className.includes("rounded-full"), `알약이 아니다: ${className}`)
  assert.ok(className.includes("text-xs"), `글자가 12px 가 아니다: ${className}`)
  assert.equal(badge?.textContent, "12")
})

// 읽지 않은 것이 없으면 표시할 이유가 없다. 컴포넌트가 이 경우를 담당하면 화면 코드가 매번
// `unread > 0 &&` 을 쓰지 않는다.
test("a count of zero renders nothing", () => {
  const view = render(<NotificationBadge count={0} />)

  assert.equal(badgeIn(view.container), null, "0 인데 렌더했다")
})

// `max` 는 붙는 자리가 정한다. 아이콘 모서리처럼 좁은 자리는 99, 목록 행처럼 넓은 자리는 999 다.
// 값을 둘로 제한해 폭이 세 글자와 네 글자로 고정되게 한다.
test("a count over the max shows the max with a plus", () => {
  assert.equal(badgeIn(render(<NotificationBadge count={100} />).container)?.textContent, "99+")

  cleanup()
  assert.equal(badgeIn(render(<NotificationBadge count={99} />).container)?.textContent, "99")

  cleanup()
  assert.equal(badgeIn(render(<NotificationBadge count={1200} max={999} />).container)?.textContent, "999+")

  cleanup()
  assert.equal(badgeIn(render(<NotificationBadge count={999} max={999} />).container)?.textContent, "999")
})

test("both tones come from the same step rule", () => {
  for (const [tone, background] of Object.entries(TONE_CLASS)) {
    cleanup()
    const className = badgeIn(render(<NotificationBadge count={3} tone={tone as keyof typeof TONE_CLASS} />).container)?.className ?? ""

    assert.ok(className.split(" ").includes(background), `${tone} 에 ${background} 가 없다: ${className}`)
    assert.ok(className.split(" ").includes("text-white"), `${tone} 의 글자가 white 가 아니다: ${className}`)
  }
})

test("no tone falls back to a semantic color token", () => {
  for (const tone of Object.keys(TONE_CLASS)) {
    cleanup()
    const className = badgeIn(render(<NotificationBadge count={3} tone={tone as keyof typeof TONE_CLASS} />).container)?.className ?? ""
    const leftover = className.match(/(?:bg|text)-oe-[\w-]+/g)

    assert.equal(leftover, null, `${tone} 가 세만틱 token 을 쓴다: ${leftover?.join(" ")}`)
  }
})

// 아이콘이나 버튼 위에 얹히면 경계가 host 와 붙어 표시가 떨어져 보이지 않는다. 배경색과 같은
// 2px 링이 그 자리를 벌린다. 겹치지 않는 자리에서는 링이 필요 없으므로 끌 수 있게 둔다.
test("the surface ring is on by default and can be turned off", () => {
  const withRing = badgeIn(render(<NotificationBadge count={3} />).container)?.className ?? ""
  assert.ok(withRing.includes("ring-2"), `링이 없다: ${withRing}`)
  assert.ok(withRing.includes("ring-oe-background-primary"), `링이 배경색이 아니다: ${withRing}`)

  cleanup()
  const withoutRing = badgeIn(render(<NotificationBadge count={3} stroke={false} />).container)?.className ?? ""
  assert.ok(!withoutRing.includes("ring-2"), `링을 끄지 못했다: ${withoutRing}`)
})

// 붙는 위치는 화면 코드가 정한다. 컴포넌트가 host 를 감싸면 쓰려는 자리의 Layout 을 건드리게
// 되므로, 여기서는 모양만 소유하고 `className` 으로 위치를 받는다.
test("a notification badge takes the position from its class name", () => {
  const className = badgeIn(render(<NotificationBadge count={3} className="absolute -right-1 -top-1" />).container)?.className ?? ""

  assert.ok(className.includes("absolute"), `위치 클래스를 받지 못했다: ${className}`)
  assert.ok(className.includes("-right-1"), `위치 클래스를 받지 못했다: ${className}`)
})

// 점은 「처리할 것이 있다」만 말하는 자리이고 색으로 뜻을 나눌 여지가 없다. 그래서 tone 을 받지
// 않고 accent 로 고정한다. neutral 은 수를 함께 보이는 개수 형태에서만 뜻을 갖는다.
test("a dot is always the accent tone", () => {
  const className = badgeIn(render(<NotificationBadge />).container)?.className ?? ""

  assert.ok(className.split(" ").includes("bg-red-600"), `점이 accent 가 아니다: ${className}`)
})

test("a notification badge tells its shape and tone through data attributes", () => {
  const dot = badgeIn(render(<NotificationBadge />).container)
  assert.equal(dot?.getAttribute("data-shape"), "dot")
  assert.equal(dot?.getAttribute("data-tone"), "accent")

  cleanup()
  const count = badgeIn(render(<NotificationBadge count={3} tone="neutral" />).container)
  assert.equal(count?.getAttribute("data-shape"), "count")
  assert.equal(count?.getAttribute("data-tone"), "neutral")
})
