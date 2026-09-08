import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Badge } from "./badge"

afterEach(() => {
  cleanup()
})

function badgeIn(container: HTMLElement) {
  return container.querySelector("[data-slot=badge]")
}

// docs/system/components/badge.md 는 Badge 가 자기 크기 체계를 쓰며 공통 Control Height 를
// 따르지 않는다고 정한다. 첫 구현은 24px 하나이며 크기 variant 는 뒤에 더한다.
test("a badge is 24px tall", () => {
  const view = render(<Badge>Label</Badge>)

  assert.ok(badgeIn(view.container)?.className.includes("h-6"), `24px 가 아니다: ${badgeIn(view.container)?.className}`)
})

// 색은 oe semantic token 으로만 받는다. Tailwind primitive 를 직접 참조하면 Light·Dark 조합을
// 컴포넌트가 들고 있어야 하고, 브랜드 seed 가 바뀔 때 따라가지 못한다.
test("every tone and variant pair renders with oe tokens only", () => {
  const tones = ["brand", "neutral"] as const
  const variants = ["fill", "tonal", "outlined"] as const

  for (const tone of tones) {
    for (const variant of variants) {
      cleanup()
      const view = render(<Badge tone={tone} variant={variant}>Label</Badge>)
      const badge = badgeIn(view.container)

      assert.ok(badge, `${tone}/${variant} 를 렌더하지 못했다`)
      const raw = badge.className.match(/(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-?[0-9]*/g)
      assert.equal(raw, null, `${tone}/${variant} 가 raw 색을 쓴다: ${raw?.join(" ")}`)
    }
  }
})

test("the outlined variant shows its border and the filled ones do not", () => {
  const outlined = render(<Badge variant="outlined">Label</Badge>)
  assert.ok(/border-(oe|\[var\(--brand-alpha)/.test(badgeIn(outlined.container)?.className ?? ""), "경계 색이 없다")

  cleanup()
  const fill = render(<Badge variant="fill">Label</Badge>)
  assert.ok(badgeIn(fill.container)?.className.includes("border-transparent"), "채운 Badge 의 경계가 투명하지 않다")
})

// outlined 의 경계는 tone 색의 30% 알파다. 불투명한 한 단계를 쓰면 같은 색의 tonal 배경과
// 경계가 서로 다른 밝기로 갈려 한 컴포넌트로 보이지 않는다. brand 는 HCT alpha ramp 의
// `brand-alpha-30` 을 쓰고, 나머지 tone 은 그 tone 의 색에 30% 알파를 얹는다. neutral 은
// `border-primary` 가 이미 옅은 단계라 30% 로 낮추면 사라지므로 진한 쪽을 기준으로 삼는다.
test("the outlined border is the tone color at 30% alpha", () => {
  const expected = [
    ["brand", "border-[var(--brand-alpha-30)]"],
    ["neutral", "border-oe-border-bold-primary/30"],
    ["warning", "border-oe-warning-border-primary/30"],
    ["danger", "border-oe-danger-border-primary/30"],
    ["success", "border-oe-success-border-primary/30"],
    ["info", "border-oe-info-border-primary/30"],
  ] as const

  for (const [tone, border] of expected) {
    cleanup()
    const view = render(<Badge tone={tone} variant="outlined">Label</Badge>)
    const className = badgeIn(view.container)?.className ?? ""

    assert.ok(className.includes(border), `${tone} outlined 의 경계가 ${border} 가 아니다: ${className}`)
  }
})

// 아이콘은 Label 앞에만 붙는다. Badge 는 누르는 동작이 없으므로 뒤쪽 아이콘이 가리킬 동작이
// 없고, 지우기나 펼치기가 필요하면 Chip 이나 Button 이 담당한다. shadcn base-nova 가 두 변에
// 두었던 여백 보정도 앞쪽만 남긴다.
test("a badge trims the padding only on the leading side", () => {
  const view = render(<Badge>Label</Badge>)
  const className = badgeIn(view.container)?.className ?? ""

  assert.ok(className.includes("has-data-[icon=inline-start]:pl-1.5"), "앞쪽 아이콘 여백 보정이 없다")
  assert.ok(!className.includes("inline-end"), `뒤쪽 아이콘 규칙이 남아 있다: ${className}`)
})

test("a badge can render as another element through the render prop", () => {
  const view = render(<Badge render={<a href="/somewhere" />}>Label</Badge>)
  const badge = badgeIn(view.container)

  assert.equal(badge?.tagName.toLowerCase(), "a")
  assert.equal(badge?.getAttribute("href"), "/somewhere")
})

test("fill and tonal are told apart by their background", () => {
  const fill = render(<Badge tone="brand" variant="fill">Label</Badge>)
  const fillClass = badgeIn(fill.container)?.className ?? ""

  cleanup()
  const tonal = render(<Badge tone="brand" variant="tonal">Label</Badge>)
  const tonalClass = badgeIn(tonal.container)?.className ?? ""

  assert.ok(fillClass.includes("bg-oe-brand-background-bold-primary"), `fill 이 진한 배경을 쓰지 않는다: ${fillClass}`)
  assert.ok(tonalClass.includes("bg-oe-brand-background-secondary"), `tonal 이 정해진 배경을 쓰지 않는다: ${tonalClass}`)
})

// 상태를 나타내는 tone 은 oe semantic family 를 그대로 쓴다. accent 는 token 이 fill 하나뿐이고
// 그 색이 danger 와 같은 red 계열이라 이번 범위에서 뺐다.
test("each status tone renders with its own oe family", () => {
  const pairs = [
    ["warning", "oe-warning"],
    ["danger", "oe-danger"],
    ["success", "oe-success"],
    ["info", "oe-info"],
  ] as const

  for (const [tone, family] of pairs) {
    cleanup()
    const view = render(<Badge tone={tone}>Label</Badge>)
    const className = badgeIn(view.container)?.className ?? ""

    assert.ok(className.includes(family), `${tone} 이 ${family} token 을 쓰지 않는다: ${className}`)
  }
})

// custom 은 색 이름을 받아 Tailwind primitive 를 단계 규칙대로 매핑한다. 규칙은 tokens 의
// statusFamily 와 같게 두어, 같은 색을 semantic family 로 올릴 때 값이 달라지지 않게 한다.
test("a custom tone maps a tailwind color with the same steps as a status family", () => {
  const view = render(<Badge tone="custom" color="orange" variant="tonal">Label</Badge>)
  const className = badgeIn(view.container)?.className ?? ""

  assert.ok(className.includes("bg-orange-100"), `tonal 배경이 100 단계가 아니다: ${className}`)
  assert.ok(className.includes("dark:bg-orange-900"), `dark tonal 배경이 900 단계가 아니다: ${className}`)
  assert.ok(className.includes("text-orange-800"), `글자가 800 단계가 아니다: ${className}`)
})

test("a custom tone keeps the same step rule across variants", () => {
  const fill = render(<Badge tone="custom" color="teal" variant="fill">Label</Badge>)
  assert.ok(badgeIn(fill.container)?.className.includes("bg-teal-700"), "fill 배경이 700 단계가 아니다")

  cleanup()
  const outlined = render(<Badge tone="custom" color="teal" variant="outlined">Label</Badge>)
  assert.ok(badgeIn(outlined.container)?.className.includes("border-teal-500/30"), "outlined 경계가 500 단계의 30% 알파가 아니다")
})
