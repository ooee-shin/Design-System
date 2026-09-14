import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { RiHome5Fill, RiSettings3Fill, RiUser3Fill } from "@remixicon/react"

import { BottomNavigation, type BottomNavigationItem } from "./bottom-navigation"

afterEach(() => cleanup())

const ITEMS: BottomNavigationItem[] = [
  { value: "home", label: "홈", icon: <RiHome5Fill data-testid="icon-home" /> },
  { value: "orders", label: "주문", icon: <RiSettings3Fill data-testid="icon-orders" /> },
  { value: "me", label: "내정보", icon: <RiUser3Fill data-testid="icon-me" /> },
]

function renderNav(element: React.ReactElement) {
  const view = render(element)
  const nav = view.container.querySelector("[data-slot=bottom-navigation]")
  assert.ok(nav, "bottom-navigation slot 이 그려지지 않았다")
  return { view, nav: nav as HTMLElement }
}

function items(nav: HTMLElement) {
  return [...nav.querySelectorAll("[data-slot=bottom-navigation-item]")] as HTMLElement[]
}

function assertHas(className: string, expected: readonly string[], context: string) {
  for (const item of expected) {
    assert.ok(className.split(" ").includes(item), `${context} 에 ${item} 가 없다: ${className}`)
  }
}

function assertLacks(className: string, unexpected: readonly string[], context: string) {
  for (const item of unexpected) {
    assert.ok(!className.split(" ").includes(item), `${context} 에 ${item} 가 남아 있다: ${className}`)
  }
}

test("항목마다 아이콘과 라벨을 넘긴 순서대로 그린다", () => {
  const { nav, view } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  assert.deepEqual(items(nav).map((item) => item.textContent), ["홈", "주문", "내정보"])
  assert.ok(items(nav)[0].contains(view.getByTestId("icon-home")), "첫 항목에 아이콘이 없다")
})

// 화면 이동이지 탭 전환이 아니므로 `role="tab"` 을 쓰지 않는다. 지금 어느 화면에 있는지는
// `aria-current` 가 전달한다.
test("선택된 항목만 aria-current 를 갖는다", () => {
  const { nav } = renderNav(<BottomNavigation value="orders" items={ITEMS} />)

  assert.deepEqual(
    items(nav).map((item) => item.getAttribute("aria-current")),
    [null, "page", null],
  )
})

test("nav 안의 button 목록으로 그린다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  assert.equal(nav.tagName, "NAV")
  assert.deepEqual(items(nav).map((item) => item.tagName), ["BUTTON", "BUTTON", "BUTTON"])
})

test("항목을 누르면 그 value 로 onValueChange 를 부른다", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  const changes: string[] = []
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} onValueChange={(next) => changes.push(next)} />)

  await user.click(items(nav)[2])

  assert.deepEqual(changes, ["me"])
})

// 선택은 컴포넌트가 스스로 바꾸지 않는다. 어느 화면에 있는지는 라우팅이 소유하므로 값을 넘긴
// 쪽이 다음 값을 정한다.
test("눌러도 스스로 선택을 옮기지 않는다", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  await user.click(items(nav)[1])

  assert.equal(items(nav)[0].getAttribute("aria-current"), "page")
  assert.equal(items(nav)[1].getAttribute("aria-current"), null)
})

// 아이콘은 선택 여부와 무관하게 `Fill` 하나를 쓰고 색만 바뀐다. 항목이 나란히 서는 자리에서
// 시각적 위계를 잡기 위해서이며 근거는 `icon.md` 가 소유한다.
// 선택은 Brand 가 아니라 가장 진한 중립이다. 하단 내비가 알리는 것은 브랜드가 아니라 지금 어느
// 화면에 있는지이며, 그 자리에 유채색을 두면 다섯 항목 중 하나만 색을 갖는 강조로 읽힌다.
test("선택된 항목만 가장 진한 중립이 되고 나머지는 낮은 위계로 둔다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  const [selected, unselected] = items(nav)

  assertHas(selected.className, ["text-oe-foreground-primary"], "선택된 항목")
  assertHas(unselected.className, ["text-oe-foreground-tertiary"], "선택되지 않은 항목")
  assertLacks(unselected.className, ["text-oe-foreground-primary"], "선택되지 않은 항목")
})

// 선택되지 않은 항목에서 아이콘은 라벨보다 한 단계 더 옅다. 아이콘이 라벨과 같은 무게로 서면
// 선택되지 않은 항목이 다섯 개 나란히 있을 때 화면 아래쪽이 무거워진다.
test("선택되지 않은 항목은 아이콘을 라벨보다 옅게 둔다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  const unselectedIcon = items(nav)[1].querySelector("[data-slot=bottom-navigation-icon]") as HTMLElement

  assertHas(unselectedIcon.className, ["text-neutral-400", "dark:text-neutral-600"], "선택되지 않은 항목의 아이콘")
})

// 선택된 항목에서는 아이콘과 라벨이 같은 Brand 색이다. 아이콘만 옅게 두면 무엇이 선택되었는지가
// 두 색으로 갈려 읽힌다.
test("선택된 항목은 아이콘과 라벨이 같은 색이다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  const selectedIcon = items(nav)[0].querySelector("[data-slot=bottom-navigation-icon]") as HTMLElement

  assertLacks(selectedIcon.className, ["text-neutral-400"], "선택된 항목의 아이콘")
})

test("아이콘은 선택 여부와 관계없이 같은 것을 그린다", () => {
  const { view } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  assert.ok(view.queryByTestId("icon-home"), "선택된 항목의 아이콘이 없다")
  assert.ok(view.queryByTestId("icon-orders"), "선택되지 않은 항목의 아이콘이 없다")
})

// 항목 폭은 개수에 따라 균등하게 나뉜다. 내용 폭을 따르면 라벨이 긴 항목만 넓어져 누르는
// 자리가 항목마다 달라진다.
test("항목은 같은 폭을 나눠 갖는다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  for (const item of items(nav)) {
    assertHas(item.className, ["flex-1"], "항목")
  }
})

// 홈 인디케이터가 없는 기기에서는 `safe-area-inset-bottom` 이 0 이라 항목이 화면 맨 아래에 붙는다.
// 그 자리는 손가락이 닿기 어렵고 가장자리 제스처와도 겹치므로 최소 여백을 함께 보장한다.
test("안전 영역이 없는 기기에서도 하단에 최소 여백을 둔다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  assertHas(nav.className, ["pb-[max(env(safe-area-inset-bottom),1rem)]"], "Container")
})

// 태블릿처럼 넓은 폭에서 항목이 지나치게 벌어지지 않도록 안쪽 목록의 폭을 제한한다.
test("항목 목록의 폭에 상한을 둔다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  const list = nav.querySelector("[data-slot=bottom-navigation-list]") as HTMLElement | null
  assert.ok(list, "항목 목록 자리가 없다")
  assertHas(list.className, ["max-w-[480px]", "mx-auto"], "항목 목록")
})

test("badge 를 넘긴 항목에만 알림 표시를 붙인다", () => {
  const withBadge: BottomNavigationItem[] = [
    ITEMS[0],
    { ...ITEMS[1], badge: { count: 3 } },
    { ...ITEMS[2], badge: {} },
  ]
  const { nav } = renderNav(<BottomNavigation value="home" items={withBadge} />)

  const badges = items(nav).map((item) => item.querySelector("[data-slot=notification-badge]"))
  assert.ok(badges[0] === null, "badge 를 넘기지 않은 항목에 표시가 붙었다")
  assert.equal(badges[1]?.textContent, "3")
  assert.equal(badges[2]?.textContent, "", "count 가 없으면 점이어야 한다")
})

// 라벨은 한 줄에서 끝난다. 두 줄로 넘어가면 그 항목만 높아져 목록의 기준선이 어긋난다.
test("라벨은 줄바꿈하지 않는다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  const label = items(nav)[0].querySelector("[data-slot=bottom-navigation-label]") as HTMLElement
  assertHas(label.className, ["truncate"], "라벨")
})

// 여섯 개부터는 라벨이 들어갈 폭이 남지 않는다. 조용히 잘라 내면 넘긴 항목이 화면에서 사라진
// 이유를 알 수 없으므로 개발 중에 드러나게 한다.
test("항목이 다섯을 넘으면 오류를 낸다", () => {
  const tooMany: BottomNavigationItem[] = Array.from({ length: 6 }, (_, index) => ({
    value: `item-${index}`,
    label: `항목${index}`,
    icon: <RiHome5Fill />,
  }))

  assert.throws(() => render(<BottomNavigation value="item-0" items={tooMany} />), /5/)
})
