import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { readFileSync } from "node:fs"

import { Badge, BADGE_COLORS } from "./badge"

afterEach(() => {
  cleanup()
})

function badgeIn(container: HTMLElement) {
  return container.querySelector("[data-slot=badge]")
}

// tone 별 프리미티브 팔레트다. brand 는 Tailwind 팔레트가 아니라 seed 에서 생성되므로
// `--brand-{단계}` 를 참조한다. 단계 이름이 같기 때문에 brand 도 같은 규칙에 들어온다.
const PALETTES = [
  ["brand", (step: number) => `[var(--brand-${step})]`],
  ["neutral", (step: number) => `neutral-${step}`],
  ["warning", (step: number) => `amber-${step}`],
  ["danger", (step: number) => `red-${step}`],
  ["success", (step: number) => `green-${step}`],
  ["info", (step: number) => `blue-${step}`],
] as const

// variant 는 tone 색을 배경·글자·경계 중 어디에 어느 단계로 쓸지만 정한다. fill 배경은 600 이며
// 글자는 어느 색에서나 white 다. WCAG 2.x 만 보면 600 에서 절반이 4.5:1 아래지만, 색조를 반영하는
// APCA 로는 white 글자가 전부 60 을 넘고 뒤집으면 오히려 절반으로 떨어진다. 700 을 쓰면 대비는
// 넉넉해지지만 amber·yellow·lime 이 황토색으로 읽힌다. 근거는 badge.md 의 「색」에 있다.
// tonal 배경은 Light 가 불투명한 100 이고 Dark 는 300 의 20% 알파다. Dark 에서 불투명한 단계를
// 쓰면 같은 단계를 Surface 로 두는 자리에서 배경이 겹쳐 Container 가 사라진다.
const STEP_RULE = {
  fill: (color: (step: number) => string) => [`bg-${color(600)}`, "text-white"],
  tonal: (color: (step: number) => string) => [`bg-${color(100)}`, `text-${color(800)}`, `dark:bg-${color(300)}/20`, `dark:text-${color(200)}`],
  outlined: (color: (step: number) => string) => [`border-${color(500)}/30`, `text-${color(800)}`, `dark:text-${color(300)}`],
} as const

// docs/system/components/badge.md 는 Badge 가 자기 크기 체계를 쓰며 공통 Control Height 를
// 따르지 않는다고 정한다. 단계는 20px 과 24px 둘이며, 덧붙는 표시이므로 작은 쪽을 기본값으로 둔다.
const SIZE_RULE = {
  small: { height: "h-5", padding: "px-1.5", iconSide: "has-data-[icon=inline-start]:pl-1" },
  medium: { height: "h-6", padding: "px-2", iconSide: "has-data-[icon=inline-start]:pl-1.5" },
} as const

test("a badge is 20px tall by default", () => {
  const className = badgeIn(render(<Badge>Label</Badge>).container)?.className ?? ""

  assert.ok(className.includes("h-5"), `20px 가 아니다: ${className}`)
})

// 높이가 커지면 좌우 여백도 한 단계 올린다. 20px 에서 6px 이던 여백을 24px 에서 그대로 두면 글자가
// 위아래보다 좌우에서 더 붙어 보인다. 아이콘이 붙는 변의 보정도 같은 폭으로 따라 올린다.
test("each size carries its own height and side padding", () => {
  for (const [size, rule] of Object.entries(SIZE_RULE)) {
    cleanup()
    const className = badgeIn(render(<Badge size={size as keyof typeof SIZE_RULE}>Label</Badge>).container)?.className ?? ""

    for (const expected of [rule.height, rule.padding, rule.iconSide]) {
      assert.ok(className.split(" ").includes(expected), `${size} 에 ${expected} 가 없다: ${className}`)
    }
  }
})

// 모양은 크기와 독립적인 축이다. 두 단계가 같은 6px 모서리를 쓰므로, 나란히 놓아도 한 컴포넌트의
// 두 크기로 읽힌다.
test("both sizes keep the same corner", () => {
  for (const size of Object.keys(SIZE_RULE)) {
    cleanup()
    const className = badgeIn(render(<Badge size={size as keyof typeof SIZE_RULE}>Label</Badge>).container)?.className ?? ""

    assert.ok(className.includes("rounded-sm"), `${size} 의 모서리가 6px 이 아니다: ${className}`)
  }
})

// 색은 tone 별 팔레트와 variant 별 단계의 곱으로만 정한다. 세만틱 token 이름은 tone 마다 구간이
// 달라서 21개 조합을 하나씩 적게 만들었고, 그래서 한 조합을 고쳐도 나머지 20개가 따라오지
// 않았다. 단계로 내려가면 규칙 셋과 팔레트 일곱으로 줄고 예외가 남지 않는다.
test("every tone and variant pair comes from one step rule", () => {
  for (const [tone, color] of PALETTES) {
    for (const [variant, rule] of Object.entries(STEP_RULE)) {
      cleanup()
      const view = render(<Badge tone={tone} variant={variant as keyof typeof STEP_RULE}>Label</Badge>)
      const badge = badgeIn(view.container)

      assert.ok(badge, `${tone}/${variant} 를 렌더하지 못했다`)

      for (const expected of rule(color)) {
        assert.ok(badge.className.split(" ").includes(expected), `${tone}/${variant} 에 ${expected} 가 없다: ${badge.className}`)
      }
    }
  }
})

// 단계 규칙을 벗어나는 자리가 남아 있지 않아야 한다. 세만틱 token 을 하나라도 색으로 쓰면
// 그 tone 만 다른 체계를 따르게 되어 21개를 다시 개별로 확인해야 한다.
test("no tone falls back to a semantic color token", () => {
  for (const [tone] of PALETTES) {
    for (const variant of Object.keys(STEP_RULE)) {
      cleanup()
      const view = render(<Badge tone={tone} variant={variant as keyof typeof STEP_RULE}>Label</Badge>)
      const leftover = (badgeIn(view.container)?.className ?? "").match(/(?:bg|text|border)-oe-[\w-]+/g)

      assert.equal(leftover, null, `${tone}/${variant} 가 세만틱 token 을 쓴다: ${leftover?.join(" ")}`)
    }
  }
})

// 회색 계열은 `gray` 하나만 남긴다. Tailwind 의 회색 다섯은 Badge 크기에서 서로 구별되지 않고,
// 회색이 필요한 자리는 `neutral` tone 이 이미 담당한다. 고르는 사람에게는 다섯 중 무엇을 쓸지가
// 판단할 거리 없이 늘어난 선택지였다.
test("the custom tone offers only one gray family", () => {
  assert.ok(BADGE_COLORS.includes("gray"), "gray 가 없다")

  for (const removed of ["slate", "zinc", "neutral", "stone"]) {
    assert.ok(!(BADGE_COLORS as readonly string[]).includes(removed), `회색 계열 ${removed} 가 남아 있다`)
  }
})

// 클래스를 tone 과 단계로 조립하므로 Tailwind 는 `@source inline` 선언만 보고 생성한다. 색을
// 늘리거나 줄일 때 그 선언을 함께 고치지 않으면 화면에서 색이 빠진 채로 렌더된다.
test("every palette the badge can render has its classes generated", () => {
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8")
  const declared = new Set(
    css.matchAll(/@source inline\("[\w:-]*\{([^}]+)\}/g).flatMap((match) => match[1].split(",")),
  )

  // neutral tone 은 `color` 로 고를 수 없지만 팔레트로는 쓰이므로 함께 있어야 한다.
  for (const palette of [...BADGE_COLORS, "neutral"]) {
    assert.ok(declared.has(palette), `${palette} 의 클래스를 생성하지 않는다`)
  }

  for (const palette of declared) {
    assert.ok(
      palette === "neutral" || (BADGE_COLORS as readonly string[]).includes(palette),
      `쓰이지 않는 팔레트 ${palette} 를 생성한다`,
    )
  }
})

test("the outlined variant shows its border and the filled ones do not", () => {
  const outlined = render(<Badge variant="outlined">Label</Badge>)
  assert.ok(/border-\S+\/30/.test(badgeIn(outlined.container)?.className ?? ""), "경계 색이 없다")

  cleanup()
  const fill = render(<Badge variant="fill">Label</Badge>)
  assert.ok(badgeIn(fill.container)?.className.includes("border-transparent"), "채운 Badge 의 경계가 투명하지 않다")
})

// outlined 의 경계는 어느 tone 에서나 그 tone 색 500 단계의 30% 알파다. 불투명한 한 단계를 쓰면
// 같은 색의 tonal 배경과 경계가 서로 다른 밝기로 갈려 한 컴포넌트로 보이지 않는다.
test("the outlined border is the tone color at 30% alpha", () => {
  for (const [tone, color] of PALETTES) {
    cleanup()
    const view = render(<Badge tone={tone} variant="outlined">Label</Badge>)
    const className = badgeIn(view.container)?.className ?? ""

    assert.ok(className.includes(`border-${color(500)}/30`), `${tone} outlined 의 경계가 500 단계의 30% 알파가 아니다: ${className}`)
  }
})

// 모양은 vocabulary.md 의 `Rounded` 다. Badge 는 interaction.md 의 「공통 Control Radius」 적용
// 대상이 아니고 시스템에서 가장 작은 요소이므로, 컨트롤의 8px 이 아니라 한 단계 작은 6px 을 쓴다.
// 20px 높이에서 8px 은 반지름이 높이의 40% 라 모서리가 거의 원호로 읽힌다.
test("a badge is rounded, not a pill", () => {
  const className = badgeIn(render(<Badge>Label</Badge>).container)?.className ?? ""

  assert.ok(className.includes("rounded-sm"), `6px 모서리가 아니다: ${className}`)
  assert.ok(!className.includes("rounded-full") && !className.includes("rounded-4xl"), `알약 모양이 남아 있다: ${className}`)
})

// 아이콘은 Label 앞에만 붙는다. Badge 는 누르는 동작이 없으므로 뒤쪽 아이콘이 가리킬 동작이
// 없고, 지우기나 펼치기가 필요하면 Chip 이나 Button 이 담당한다. shadcn base-nova 가 두 변에
// 두었던 여백 보정도 앞쪽만 남긴다. 아이콘이 붙는 변은 한 단계 더 좁혀 4px 로 둔다.
test("a badge trims the padding only on the leading side", () => {
  const view = render(<Badge>Label</Badge>)
  const className = badgeIn(view.container)?.className ?? ""

  assert.ok(className.includes("has-data-[icon=inline-start]:pl-1"), "앞쪽 아이콘 여백 보정이 없다")
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

  assert.ok(fillClass.includes("bg-[var(--brand-600)]"), `fill 이 600 단계 배경을 쓰지 않는다: ${fillClass}`)
  assert.ok(tonalClass.includes("bg-[var(--brand-100)]"), `tonal 이 100 단계 배경을 쓰지 않는다: ${tonalClass}`)
})

// custom 은 semantic family 가 없는 색을 임시로 쓰는 자리다. 받은 색 이름만 팔레트로 바뀌고
// 단계 규칙은 다른 tone 과 같으므로, 나중에 그 색을 정식 tone 으로 올려도 화면이 달라지지 않는다.
test("a custom tone follows the same step rule with the color it is given", () => {
  const color = (step: number) => `orange-${step}`

  for (const [variant, rule] of Object.entries(STEP_RULE)) {
    cleanup()
    const view = render(<Badge tone="custom" color="orange" variant={variant as keyof typeof STEP_RULE}>Label</Badge>)
    const className = badgeIn(view.container)?.className ?? ""

    for (const expected of rule(color)) {
      assert.ok(className.split(" ").includes(expected), `custom/${variant} 에 ${expected} 가 없다: ${className}`)
    }
  }
})
