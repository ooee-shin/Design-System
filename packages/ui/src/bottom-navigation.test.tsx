import "./test-setup"

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
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
  assertHas(unselected.className, ["text-oe-foreground-subtle"], "선택되지 않은 항목")
  assertLacks(unselected.className, ["text-oe-foreground-primary"], "선택되지 않은 항목")
})

// 선택되지 않은 항목은 아이콘과 라벨이 같은 색이다. 둘을 갈라 놓으면 아이콘이 먼저 사라지면서
// 항목이 무엇인지 알아보기 어려워진다.
test("선택되지 않은 항목은 아이콘과 라벨이 같은 색이다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  const unselectedIcon = items(nav)[1].querySelector("[data-slot=bottom-navigation-icon]") as HTMLElement

  assertHas(unselectedIcon.className, ["text-oe-foreground-subtle"], "선택되지 않은 항목의 아이콘")
})

// 선택된 항목에서는 아이콘과 라벨이 같은 Brand 색이다. 아이콘만 옅게 두면 무엇이 선택되었는지가
// 두 색으로 갈려 읽힌다.
test("선택된 항목은 아이콘과 라벨이 같은 색이다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  const selectedIcon = items(nav)[0].querySelector("[data-slot=bottom-navigation-icon]") as HTMLElement

  assertLacks(selectedIcon.className, ["text-oe-foreground-subtle"], "선택된 항목의 아이콘")
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

// 목록은 주어진 폭을 그대로 쓴다. 컴포넌트가 자기 상한을 들고 있으면 뷰포트를 넓혔을 때 바탕만
// 넓어지고 항목은 가운데 모여 서서, 폭을 정한 쪽의 결정이 화면에 반영되지 않는다. 지나치게
// 벌어지는 것은 뷰포트나 그 페이지가 다룬다.
// 바닥에 붙는 줄에서도 초점선이 항목의 네모 전체를 두르지 않는다. 선택 표시와 같은 자리에 같은
// 모양으로 그려서 무엇이 켜질 자리인지 그대로 읽히게 한다.
test("bar 의 초점선은 선택 표시와 같은 모양으로 선다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  const icon = nav.querySelector("[data-slot=bottom-navigation-icon]") as HTMLElement

  assertHas(
    icon.className,
    ["before:h-9", "before:w-10", "before:rounded-xl", "group-focus-visible/item:before:ring-2"],
    "아이콘 자리",
  )

  const [item] = items(nav)
  assertLacks(item.className, ["focus-visible:ring-inset"], "항목")
})

// 네모난 초점선이 둥근 알약 안에 서면 모양이 어긋난다. 떠 있는 형태에서는 선택 표시와 같은 자리에
// 같은 모양으로 그린다.
test("floating 의 초점선은 선택 표시와 같은 모양으로 선다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} variant="floating" />)
  const [item] = items(nav)

  assertHas(
    item.className,
    ["after:inset-y-2", "after:rounded-full", "focus-visible:after:ring-2", "focus-visible:after:ring-oe-focus-ring"],
    "항목",
  )
  assertLacks(item.className, ["focus-visible:ring-inset"], "항목")
})

// 떠 있는 형태는 화면 바닥에 붙지 않고 좌우에 여백을 두고 선다. 경계선 없이 그림자만으로 본문과
// 갈린다. 선을 두르면 바닥에 붙은 줄과 같은 모양이 되어 떠 있는 것으로 읽히지 않는다.
test("floating 은 선 없이 떠 있는 알약으로 선다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} variant="floating" />)

  assertHas(nav.className, ["mx-3", "rounded-full", "shadow-sm"], "내비게이션")
  assertLacks(nav.className, ["border-t", "border-oe-border-secondary"], "내비게이션")
})

// 라벨을 감추면 줄 자체가 낮아진다. 글자가 빠진 만큼 높이가 남으면 아이콘만 있는 알약이 속 빈
// 상자로 보인다. 높이가 끊기지 않고 바뀌도록 전환을 함께 건다.
test("floating 의 높이는 라벨 유무를 따라간다", () => {
  const shown = renderNav(<BottomNavigation value="home" items={ITEMS} variant="floating" showLabels />)
  const shownList = shown.nav.querySelector("[data-slot=bottom-navigation-list]") as HTMLElement
  assertHas(shownList.className, ["h-18", "transition-[height]"], "라벨이 보이는 목록")

  cleanup()

  const hidden = renderNav(<BottomNavigation value="home" items={ITEMS} variant="floating" />)
  const hiddenList = hidden.nav.querySelector("[data-slot=bottom-navigation-list]") as HTMLElement
  assertHas(hiddenList.className, ["h-16"], "라벨을 감춘 목록")
})

// 선택 표시가 항목마다 켜졌다 꺼지면 어디에서 어디로 옮겨 갔는지 읽히지 않는다. 하나가 자리를
// 옮기게 해서 이동 자체를 보여 준다.
test("floating 의 선택 표시는 하나가 자리를 옮긴다", () => {
  const { nav } = renderNav(<BottomNavigation value={ITEMS[1].value} items={ITEMS} variant="floating" />)

  const indicator = nav.querySelector("[data-slot=bottom-navigation-indicator]") as HTMLElement | null
  assert.ok(indicator, "선택 표시가 없다")
  assertHas(indicator.className, ["absolute", "rounded-full", "transition-transform", "motion-reduce:transition-none"], "선택 표시")
  assert.equal(indicator.style.transform, "translateX(100%)")

  // 표시가 하나뿐이므로 항목은 자기 배경을 갖지 않는다.
  for (const item of items(nav)) {
    assertLacks(item.className, ["bg-oe-background-secondary"], "항목")
  }
})

// 누르는 동안 아이콘이 작아졌다가 선택되면 조금 커진다. 눌린 것이 손에서 떨어지기 전에 화면에서
// 먼저 읽힌다.
test("floating 의 아이콘은 누르면 작아지고 선택되면 커진다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} variant="floating" />)
  const [selected, unselected] = items(nav)

  const icon = (item: HTMLElement) => item.querySelector("[data-slot=bottom-navigation-icon]") as HTMLElement
  assertHas(icon(selected).className, ["scale-105", "transition-transform"], "선택된 항목의 아이콘")
  assertHas(icon(unselected).className, ["group-active/item:scale-90"], "선택되지 않은 항목의 아이콘")
})

// 기본은 지금까지의 꽉 찬 줄이다. 형태를 고르지 않은 화면이 조용히 바뀌면 안 된다.
test("형태의 기본값은 화면 바닥에 붙는 줄이다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  assertHas(nav.className, ["border-t", "w-full"], "내비게이션")
  assertLacks(nav.className, ["rounded-full"], "내비게이션")
})

// 글자를 화면에서 지워도 항목의 이름은 남아야 한다. 이름이 사라지면 화면 낭독기를 쓰는 사람에게
// 다섯 항목이 모두 「버튼」으로만 읽힌다.
test("showLabels 를 끄면 글자만 감추고 이름은 남는다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  const label = nav.querySelector("[data-slot=bottom-navigation-label]") as HTMLElement | null
  assert.ok(label, "Label 자리가 없다")
  assertHas(label.className, ["sr-only"], "Label")
  assert.equal(label.textContent, ITEMS[0].label)
})

// 아이콘과 Label 사이는 형태가 정한다. 바닥에 붙는 줄에서는 선택 표시가 아이콘보다 8px 아래까지
// 내려오므로 그보다 넓어야 표시가 라벨에 닿지 않는다.
test("아이콘과 Label 사이는 형태가 정한다", () => {
  const bar = renderNav(<BottomNavigation value="home" items={ITEMS} />)
  assertHas((bar.nav.querySelector("[data-slot=bottom-navigation-item]") as HTMLElement).className, ["gap-2"], "bar 항목")

  cleanup()

  const floating = renderNav(<BottomNavigation value="home" items={ITEMS} variant="floating" />)
  assertHas(
    (floating.nav.querySelector("[data-slot=bottom-navigation-item]") as HTMLElement).className,
    ["gap-1"],
    "floating 항목",
  )
})

// Label 크기는 bottom-navigation.md 의 「크기」가 소유한다. 13px 은 `text-oe-label` token 이
// 소유하는 값이고 행간 16px 이 함께 온다. 아이콘 24px 과 합쳐도 56px 안에 든다.
test("Label 은 13px label token 으로 선다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} showLabels />)

  const label = nav.querySelector("[data-slot=bottom-navigation-label]") as HTMLElement | null
  assert.ok(label, "Label 자리가 없다")
  assertHas(label.className, ["text-oe-label"], "Label")
})

test("항목 목록은 주어진 폭을 그대로 쓴다", () => {
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} />)

  const list = nav.querySelector("[data-slot=bottom-navigation-list]") as HTMLElement | null
  assert.ok(list, "항목 목록 자리가 없다")
  assertHas(list.className, ["w-full"], "항목 목록")
  assert.doesNotMatch(list.className, /max-w-/, "항목 목록이 자기 폭 상한을 들고 있다")
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
  const { nav } = renderNav(<BottomNavigation value="home" items={ITEMS} showLabels />)

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

// 같은 값이 `oe-foreground-disabled` 에도 있지만 그쪽은 꺼진 요소를 뜻한다. 로컬 값으로 되돌아가면
// 두 테마 쌍을 컴포넌트가 다시 들고 있게 되므로 회귀를 막는다.
test("선택되지 않은 아이콘은 로컬 값이 아니라 semantic token 을 쓴다", () => {
  const source = readFileSync(new URL("./bottom-navigation.tsx", import.meta.url), "utf8")

  assert.match(source, /text-oe-foreground-subtle/)
  assert.doesNotMatch(source, /text-neutral-400/)
  assert.doesNotMatch(source, /dark:text-neutral-600/)
})

