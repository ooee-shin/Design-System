import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { RiStarFill, RiStarLine } from "@remixicon/react"

import { ToggleButton, type ToggleButtonSize, type ToggleButtonVariant } from "./toggle-button"

afterEach(() => cleanup())

const OFF_ICON = <RiStarLine data-testid="off-icon" />
const ON_ICON = <RiStarFill data-testid="on-icon" />

function renderToggle(element: React.ReactElement) {
  const view = render(element)
  const control = view.container.querySelector("[data-slot=toggle-button]")
  assert.ok(control, "toggle-button slot 이 그려지지 않았다")
  return { view, control: control as HTMLElement }
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

// 높이·여백·글자·아이콘 크기는 Button 과 같은 단계를 쓴다. 두 컴포넌트가 도구 모음에 나란히
// 놓이므로 한쪽만 단계를 달리하면 같은 줄에서 높이가 어긋난다. 값의 원본은
// `interaction.md` 의 「공통 Control Height」다.
const SIZE_RULE = {
  xsmall: { height: "h-oe-control-xsmall", square: "w-oe-control-xsmall", padding: "px-2.5", gap: "gap-1", leading: "has-data-[icon=inline-start]:pl-2", text: "text-sm", icon: "[&_svg:not([class*='size-'])]:size-3" },
  small: { height: "h-oe-control-small", square: "w-oe-control-small", padding: "px-3", gap: "gap-1", leading: "has-data-[icon=inline-start]:pl-2.5", text: "text-sm", icon: "[&_svg:not([class*='size-'])]:size-4" },
  regular: { height: "h-oe-control-regular", square: "w-oe-control-regular", padding: "px-3.5", gap: "gap-1", leading: "has-data-[icon=inline-start]:pl-3", text: "text-sm", icon: "[&_svg:not([class*='size-'])]:size-4" },
  large: { height: "h-oe-control-large", square: "w-oe-control-large", padding: "px-4", gap: "gap-1.5", leading: "has-data-[icon=inline-start]:pl-3.5", text: "text-sm", icon: "[&_svg:not([class*='size-'])]:size-4" },
  xlarge: { height: "h-oe-control-xlarge", square: "w-oe-control-xlarge", padding: "px-5", gap: "gap-1.5", leading: "has-data-[icon=inline-start]:pl-4", text: "text-base", icon: "[&_svg:not([class*='size-'])]:size-5" },
} as const satisfies Record<ToggleButtonSize, unknown>

const brand = (step: number) => `[var(--brand-${step})]`

test("꺼짐에서는 icon 만 그리고 activeIcon 은 DOM 에 두지 않는다", () => {
  const { view } = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assert.ok(view.queryByTestId("off-icon"), "꺼짐에서 icon 이 그려지지 않았다")
  assert.equal(view.queryByTestId("on-icon"), null, "꺼짐인데 activeIcon 이 함께 그려졌다")
})

test("켜짐에서는 activeIcon 만 그린다", () => {
  const { view } = renderToggle(<ToggleButton defaultPressed icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assert.ok(view.queryByTestId("on-icon"), "켜짐에서 activeIcon 이 그려지지 않았다")
  assert.equal(view.queryByTestId("off-icon"), null, "켜짐인데 icon 이 함께 그려졌다")
})

test("누르면 aria-pressed 와 아이콘이 함께 바뀐다", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  const { view, control } = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assert.equal(control.getAttribute("aria-pressed"), "false")

  await user.click(control)

  assert.equal(control.getAttribute("aria-pressed"), "true")
  assert.ok(view.queryByTestId("on-icon"), "누른 뒤에도 activeIcon 으로 바뀌지 않았다")
})

test("pressed 를 넘기면 값을 그대로 따르고 onPressedChange 로 알린다", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  const changes: boolean[] = []
  const { control } = renderToggle(
    <ToggleButton pressed={false} onPressedChange={(next) => changes.push(next)} icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />,
  )

  await user.click(control)

  assert.deepEqual(changes, [true])
  assert.equal(control.getAttribute("aria-pressed"), "false", "controlled 인데 컴포넌트가 스스로 상태를 바꿨다")
})

test("Label 이 없으면 정사각형이 되고 있으면 아이콘 변의 여백을 내린다", () => {
  const iconOnly = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)
  const withLabel = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON}>좋아요</ToggleButton>)

  assertHas(iconOnly.control.className, [SIZE_RULE.regular.square, "px-0"], "아이콘만 있는 ToggleButton")
  assertLacks(iconOnly.control.className, [SIZE_RULE.regular.padding], "아이콘만 있는 ToggleButton")
  assert.equal(iconOnly.control.querySelector("[data-slot=toggle-button-label]"), null)

  assertHas(withLabel.control.className, [SIZE_RULE.regular.padding, SIZE_RULE.regular.leading], "Label 이 있는 ToggleButton")
  assertLacks(withLabel.control.className, [SIZE_RULE.regular.square], "Label 이 있는 ToggleButton")
  assert.equal(withLabel.control.querySelector("[data-slot=toggle-button-label]")?.textContent, "좋아요")
})

test("아이콘은 언제나 Label 앞에 놓이고 자리를 스스로 표시한다", () => {
  const { control } = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON}>좋아요</ToggleButton>)

  const slots = [...control.children].map((child) => child.getAttribute("data-slot"))
  assert.deepEqual(slots, ["toggle-button-icon", "toggle-button-label"])
  assert.equal(control.querySelector("[data-slot=toggle-button-icon]")?.getAttribute("data-icon"), "inline-start")
})

for (const [size, rule] of Object.entries(SIZE_RULE) as [ToggleButtonSize, (typeof SIZE_RULE)[ToggleButtonSize]][]) {
  test(`controlSize ${size} 는 Button 과 같은 높이·여백·글자·아이콘 단계를 쓴다`, () => {
    const { control } = renderToggle(
      <ToggleButton controlSize={size} icon={OFF_ICON} activeIcon={ON_ICON}>좋아요</ToggleButton>,
    )

    assertHas(control.className, [rule.height, rule.padding, rule.gap, rule.leading, rule.text, rule.icon], `controlSize ${size}`)
  })
}

test("기본값은 ghost variant 와 brand tone 이며 data 속성으로 드러난다", () => {
  const { control } = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assert.equal(control.getAttribute("data-variant"), "ghost")
  assert.equal(control.getAttribute("data-tone"), "brand")
  assert.equal(control.getAttribute("data-size"), "regular")
})

// 꺼짐은 Style 과 tone 에 관계없이 하나다. 꺼진 토글은 아직 아무것도 고르지 않은 자리이므로
// 배경도 tone 색도 갖지 않는다. 규칙은 `toggle-button.md` 의 「켜짐과 꺼짐」이 소유한다.
test("꺼짐은 두 Style 이 같은 모습이며 배경도 tone 색도 없다", () => {
  const ghost = renderToggle(<ToggleButton icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)
  const tonal = renderToggle(<ToggleButton variant="tonal" icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assertHas(ghost.control.className, ["bg-transparent", "text-oe-foreground-tertiary", "hover:bg-neutral-100", "active:bg-neutral-200"], "Ghost 꺼짐")
  assertLacks(ghost.control.className, [`text-${brand(600)}`], "Ghost 꺼짐")
  assert.equal(tonal.control.className, ghost.control.className, "Tonal 꺼짐이 Ghost 꺼짐과 다르게 보인다")
})

test("Ghost 켜짐은 배경 없이 tone 색 글자만 바뀐다", () => {
  const { control } = renderToggle(<ToggleButton defaultPressed icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assertHas(control.className, ["bg-transparent", `text-${brand(600)}`, `dark:text-${brand(300)}`, `hover:bg-${brand(100)}`], "Ghost 켜짐 brand")
  assertLacks(control.className, [`bg-${brand(100)}`], "Ghost 켜짐 brand")
})

test("Tonal 은 켜질 때만 배경이 생긴다", () => {
  const { control } = renderToggle(<ToggleButton variant="tonal" defaultPressed icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assertHas(control.className, [`bg-${brand(100)}`, `text-${brand(800)}`, `dark:bg-${brand(800)}`, `dark:text-${brand(200)}`], "Tonal 켜짐")
})

// 즐겨찾기의 노랑과 찜의 빨강은 팔레트 단계 규칙에 들어오지 않는 고정 색이다. Button 의 엑셀
// 색과 같은 자리이며 `tone="custom"` 과 `color` 로만 꺼낸다.
test("custom tone 은 color 가 정한 고정 색을 켜짐에만 쓴다", () => {
  const favorite = renderToggle(<ToggleButton tone="custom" color="favorite" defaultPressed icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)
  const like = renderToggle(<ToggleButton tone="custom" color="like" defaultPressed icon={OFF_ICON} activeIcon={ON_ICON} aria-label="찜" />)
  const favoriteOff = renderToggle(<ToggleButton tone="custom" color="favorite" icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

  assert.notEqual(favorite.control.className, like.control.className, "favorite 과 like 가 같은 색을 쓴다")
  assertHas(favoriteOff.control.className, ["text-oe-foreground-tertiary"], "custom 꺼짐")
  assert.equal(favorite.control.getAttribute("data-tone"), "custom")
})

test("Focus 는 경계가 없는 두 variant 모두 떨어진 ring 을 쓴다", () => {
  for (const variant of ["ghost", "tonal"] as const satisfies readonly ToggleButtonVariant[]) {
    const { control } = renderToggle(<ToggleButton variant={variant} icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />)

    assertHas(control.className, ["focus-visible:ring-2", "focus-visible:ring-oe-focus-ring", "focus-visible:ring-offset-2"], `Focus ${variant}`)
  }
})

// Disabled 를 제공하지 않는다. 켤 수 없는 자리에는 이 버튼을 그리지 않기 때문이며, 꺼진 모습을
// 남겨 두면 소비자가 `disabled` 를 넘길 자리가 있는 것으로 읽는다.
test("Disabled 를 제공하지 않으므로 꺼진 모습의 표현도 두지 않는다", () => {
  for (const pressed of [false, true]) {
    const { control } = renderToggle(
      <ToggleButton defaultPressed={pressed} icon={OFF_ICON} activeIcon={ON_ICON} aria-label="즐겨찾기" />,
    )

    const disabledClasses = control.className.split(" ").filter((item) => item.includes("disabled:"))
    assert.deepEqual(disabledClasses, [], `Disabled 표현이 남아 있다: ${disabledClasses.join(" ")}`)
  }
})
