import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { RiDownloadLine } from "@remixicon/react"

import { Button, type ButtonVariant } from "./button"

afterEach(() => {
  cleanup()
})

function buttonIn(container: HTMLElement) {
  return container.querySelector("[data-slot=button]")
}

function renderButton(element: React.ReactElement) {
  return buttonIn(render(element).container)?.className ?? ""
}

function slotsOf(container: HTMLElement) {
  return [...(buttonIn(container)?.children ?? [])].map((child) => child.getAttribute("data-slot"))
}

function assertHas(className: string, expected: readonly string[], context: string) {
  for (const item of expected) {
    assert.ok(className.split(" ").includes(item), `${context} 에 ${item} 가 없다: ${className}`)
  }
}

// 높이는 `interaction.md` 의 「공통 Control Height」가 소유하고 Button 은 그중 다섯을 제공한다.
// XSmall 28px 이 들어오는 이유는 inbox 화면의 툴바 아이콘 버튼이 그 높이를 쓰기 때문이다.
// 좌우 여백은 높이를 따라 한 단계씩 오르고, 아이콘이 붙는 변은 한 단계 내려 광학 보정을 한다.
// 글자 크기는 XLarge 에서만 한 단계 커진다. Input 의 XLarge 가 `text-base` 인 것과 같다.
const ICON_12 = "[&_svg:not([class*='size-'])]:size-3"
const ICON_16 = "[&_svg:not([class*='size-'])]:size-4"
const ICON_20 = "[&_svg:not([class*='size-'])]:size-5"

const SIZE_RULE = {
  xsmall: { height: "h-oe-control-xsmall", padding: "px-2.5", gap: "gap-1", leading: "has-data-[icon=inline-start]:pl-2", trailing: "has-data-[icon=inline-end]:pr-2", text: "text-sm", icon: ICON_12 },
  small: { height: "h-oe-control-small", padding: "px-3", gap: "gap-1", leading: "has-data-[icon=inline-start]:pl-2.5", trailing: "has-data-[icon=inline-end]:pr-2.5", text: "text-sm", icon: ICON_16 },
  regular: { height: "h-oe-control-regular", padding: "px-3.5", gap: "gap-1", leading: "has-data-[icon=inline-start]:pl-3", trailing: "has-data-[icon=inline-end]:pr-3", text: "text-sm", icon: ICON_16 },
  large: { height: "h-oe-control-large", padding: "px-4", gap: "gap-1.5", leading: "has-data-[icon=inline-start]:pl-3.5", trailing: "has-data-[icon=inline-end]:pr-3.5", text: "text-sm", icon: ICON_16 },
  xlarge: { height: "h-oe-control-xlarge", padding: "px-5", gap: "gap-1.5", leading: "has-data-[icon=inline-start]:pl-4", trailing: "has-data-[icon=inline-end]:pr-4", text: "text-base", icon: ICON_20 },
} as const

// tone 별 프리미티브 팔레트다. brand 는 Tailwind 팔레트가 아니라 seed 에서 생성되므로
// `--brand-{단계}` 를 참조하지만 단계 이름이 같으므로 나머지 tone 과 같은 규칙에 들어온다.
const PALETTES = [
  ["brand", (step: number) => `[var(--brand-${step})]`],
  ["neutral", (step: number) => `neutral-${step}`],
  ["danger", (step: number) => `red-${step}`],
] as const

const brandColor = (step: number) => `[var(--brand-${step})]`

// variant 는 tone 색을 배경·글자·경계 중 어디에 어느 단계로 쓸지만 정한다. 단계 규칙은 Badge 와
// 같게 두어 두 컴포넌트를 나란히 놓아도 색이 어긋나지 않게 한다. Badge 가 정지 표시라 갖지 않는
// Hover 와 Pressed 만 Button 이 더 갖는데, 어느 variant 에서나 배경을 한 단계씩 진하게 밟는다.
// Light 는 100→200→300 으로 내려가고 Dark 는 800→700→600 으로 올라가 방향이 서로 반대다.
const STEP_RULE = {
  fill: (color: (step: number) => string) => [`bg-${color(600)}`, "text-white", `hover:bg-${color(700)}`, `active:bg-${color(800)}`],
  tonal: (color: (step: number) => string) => [`bg-${color(100)}`, `text-${color(800)}`, `hover:bg-${color(200)}`, `active:bg-${color(300)}`, `dark:bg-${color(800)}`, `dark:text-${color(200)}`, `dark:hover:bg-${color(700)}`, `dark:active:bg-${color(600)}`],
  outline: (color: (step: number) => string) => [`border-${color(500)}/30`, `text-${color(800)}`, `hover:bg-${color(100)}`, `active:bg-${color(200)}`, `dark:text-${color(300)}`, `dark:hover:bg-${color(800)}`, `dark:active:bg-${color(700)}`],
  ghost: (color: (step: number) => string) => [`text-${color(800)}`, `hover:bg-${color(100)}`, `active:bg-${color(200)}`, `dark:text-${color(300)}`, `dark:hover:bg-${color(800)}`, `dark:active:bg-${color(700)}`],
} as const

const variants = ["fill", "tonal", "outline", "ghost"] as const satisfies readonly ButtonVariant[]

// 엑셀 색은 팔레트 단계 규칙에 들어오지 않는다. 600 단계는 Microsoft 가 쓰는 실제 브랜드 값이고
// 나머지 단계는 그 색에서 밝기만 옮겨 같은 규칙에 태울 수 있게 만든 값이다.
const EXCEL_FILL = ["bg-[#217346]", "text-white", "hover:bg-[#1a5c38]", "active:bg-[#14452a]"]

test("a button is a regular brand fill button by default", () => {
  const className = renderButton(<Button>Label</Button>)

  assertHas(className, ["h-oe-control-regular", "rounded-oe-control", ...STEP_RULE.fill(brandColor)], "기본값")
})

test("each size carries its own height, side padding, label size and icon size", () => {
  for (const [controlSize, rule] of Object.entries(SIZE_RULE)) {
    const className = renderButton(<Button controlSize={controlSize as keyof typeof SIZE_RULE}>Label</Button>)

    assertHas(className, Object.values(rule), controlSize)
  }
})

test("every tone and variant follows the shared step rule", () => {
  for (const [tone, color] of PALETTES) {
    for (const variant of variants) {
      const className = renderButton(<Button tone={tone} variant={variant}>Label</Button>)

      assertHas(className, STEP_RULE[variant](color), `${tone} ${variant}`)
    }
  }
})

// Outline 은 경계를 그리고 Ghost 는 그리지 않는다. 그 밖의 색은 둘이 같으므로 한 자리에서 두
// variant 를 바꿔 달아도 글자 색과 Hover 가 달라지지 않는다.
test("outline draws a border and ghost does not, while their other colours match", () => {
  const outline = renderButton(<Button variant="outline">Label</Button>)
  const ghost = renderButton(<Button variant="ghost">Label</Button>)

  assertHas(outline, ["bg-transparent"], "outline")
  assertHas(ghost, ["border-transparent", "bg-transparent"], "ghost")

  const shared = STEP_RULE.ghost(brandColor)
  assertHas(outline, shared, "outline")
  assertHas(ghost, shared, "ghost")
})

// fill 과 tonal 은 배경을 스스로 채우므로 경계를 두지 않는다. 경계를 두면 같은 자리에서 variant 를
// 바꿀 때 버튼 폭이 1px 씩 달라진다. 투명 경계로 자리만 잡아 둔다.
test("fill and tonal keep a transparent border so the box never resizes", () => {
  for (const variant of ["fill", "tonal"] as const) {
    assertHas(renderButton(<Button variant={variant}>Label</Button>), ["border-transparent"], variant)
  }
})

test("the excel fill keeps the very colour Microsoft uses", () => {
  const className = renderButton(<Button tone="custom" color="excel">Label</Button>)

  assertHas(className, EXCEL_FILL, "엑셀 fill")
  assert.ok(!className.includes("dark:bg-"), `엑셀 fill 이 Dark 에서 뒤집힌다: ${className}`)
})

test("the excel colour reaches every variant", () => {
  for (const variant of variants) {
    const className = renderButton(<Button tone="custom" color="excel" variant={variant}>Label</Button>)

    assert.ok(/#[0-9a-f]{6}/.test(className), `엑셀 ${variant} 에 색이 없다: ${className}`)
  }
})

// `interaction.md` 는 Outline 형태의 컨트롤이 Disabled 에서도 외곽선을 유지하라고 정한다. 다만
// 남는 것은 선이지 그 색이 아니다. tone 색은 누를 수 있다는 신호이므로 Disabled 에서 걷어내고
// Neutral 경계로 바꾼다. Input 이 Disabled 에서 보이는 것과 같은 모습이 되어, 같은 폼 안에 나란히
// 놓인 둘이 함께 꺼져 보인다.
test("a disabled outline button trades its tone border for a neutral one", () => {
  const className = renderButton(<Button variant="outline" disabled>Label</Button>)

  assertHas(className, ["disabled:border-oe-border-primary", "dark:disabled:border-oe-border-primary"], "Disabled outline")
})

// `disabled:` 로 시작하는 클래스는 native disabled 속성이 실제로 붙어야 걸린다. Base UI 의
// Button 이 그 속성을 요소에 넘기는지 여기서 확인한다.
test("a disabled button carries the native disabled attribute", () => {
  const view = render(<Button disabled>Label</Button>)

  assert.equal((buttonIn(view.container) as HTMLButtonElement).disabled, true)
})

// Disabled 는 `dark:` 짝을 함께 갖는다. Tailwind 가 `dark:` 변형을 `disabled:` 보다 뒤에 배치하므로
// `dark:bg-...` 하나만 있어도 Dark 에서 Disabled 배경과 글자를 다시 덮어 버린다. Hover 와 Pressed
// 에도 같은 이유로 짝을 둔다.
const DISABLED_RULE = [
  "disabled:bg-oe-background-disabled",
  "disabled:text-oe-foreground-disabled",
  "disabled:hover:bg-oe-background-disabled",
  "disabled:active:bg-oe-background-disabled",
  "dark:disabled:bg-oe-background-disabled",
  "dark:disabled:text-oe-foreground-disabled",
  "dark:disabled:hover:bg-oe-background-disabled",
  "dark:disabled:active:bg-oe-background-disabled",
] as const

test("every variant drops its tone colour when disabled, in both themes", () => {
  for (const variant of variants) {
    assertHas(renderButton(<Button variant={variant} disabled>Label</Button>), DISABLED_RULE, `Disabled ${variant}`)
  }
})

test("the excel button drops its colour when disabled too", () => {
  for (const variant of variants) {
    assertHas(renderButton(<Button tone="custom" color="excel" variant={variant} disabled>Label</Button>), DISABLED_RULE, `Disabled 엑셀 ${variant}`)
  }
})

// `interaction.md` 는 Focus 표시로 세 유형을 제공하고 어느 것을 쓸지는 컴포넌트가 고른다.
// 경계가 1px 로 보이는 outline 은 유형 1 이며 그 선을 focus 색으로 바꾸고 바깥에 1px 을 더한다.
// 나머지 셋은 유형 3 이다. brand fill 버튼 위에 brand 색 선을 얹으면 배경과 구분되지 않아 focus
// 위치가 보이지 않으므로, 배경색과 무관하게 보이도록 간격을 두고 바깥에 ring 을 그린다.
test("outline moves its own border to the focus colour", () => {
  assertHas(renderButton(<Button variant="outline">Label</Button>), ["focus-visible:border-oe-focus-ring", "focus-visible:ring-1", "focus-visible:ring-oe-focus-ring"], "outline Focus")
})

test("the variants without a visible border draw a detached focus ring", () => {
  for (const variant of ["fill", "tonal", "ghost"] as const) {
    assertHas(renderButton(<Button variant={variant}>Label</Button>), ["focus-visible:ring-2", "focus-visible:ring-oe-focus-ring", "focus-visible:ring-offset-2", "focus-visible:ring-offset-oe-background-primary"], `${variant} Focus`)
  }
})

// 아이콘은 붙는 변을 스스로 밝혀야 그 변의 여백 보정이 걸린다. Badge 와 shadcn 이 쓰는 것과 같은
// `data-icon` 표시를 컴포넌트가 직접 붙이므로 소비자가 매번 적지 않는다.
test("icons declare which side they sit on", () => {
  const view = render(<Button leadingIcon={<RiDownloadLine />} trailingIcon={<RiDownloadLine />}>Label</Button>)

  assert.ok(view.container.querySelector("[data-icon=inline-start]"), "Leading icon 이 자기 변을 밝히지 않는다")
  assert.ok(view.container.querySelector("[data-icon=inline-end]"), "Trailing icon 이 자기 변을 밝히지 않는다")
})

test("the label sits between the two icons", () => {
  const view = render(<Button leadingIcon={<RiDownloadLine />} trailingIcon={<RiDownloadLine />}>Label</Button>)

  assert.deepEqual(slotsOf(view.container), ["button-leading-icon", "button-label", "button-trailing-icon"])
})

// Label 이 없으면 아이콘만 남으므로 좌우 여백을 지우고 높이와 같은 너비를 준다. 크기 단계마다
// 별도의 아이콘 전용 단계를 두면 다섯이 열이 되므로, 단계는 그대로 두고 모양만 바꾼다.
test("a button with no label becomes a square", () => {
  const className = renderButton(<Button aria-label="내려받기" leadingIcon={<RiDownloadLine />} />)

  assertHas(className, ["w-oe-control-regular", "px-0"], "아이콘 버튼")
})

test("a labelled button is not squared", () => {
  assert.ok(!renderButton(<Button leadingIcon={<RiDownloadLine />}>Label</Button>).includes("w-oe-control-"), "Label 이 있는데 정사각형이 되었다")
})

// Label 이 없는 버튼에서 아이콘은 하나다. 가운데 하나만 놓이므로 앞뒤를 나눌 자리가 없고, 둘을
// 그리면 무엇을 뜻하는 버튼인지 읽히지 않는다. 둘 다 넘어오면 Leading 을 남긴다.
test("an icon-only button shows a single icon", () => {
  const view = render(<Button aria-label="내려받기" leadingIcon={<RiDownloadLine />} trailingIcon={<RiDownloadLine />} />)

  assert.deepEqual(slotsOf(view.container), ["button-leading-icon"])
})

test("an icon-only button can carry the trailing icon alone", () => {
  const view = render(<Button aria-label="다음" trailingIcon={<RiDownloadLine />} />)

  assert.deepEqual(slotsOf(view.container), ["button-trailing-icon"])
})

// 기본 너비는 내용에 맞춘다. 버튼은 도구 모음과 표 안에도 놓이므로 부모를 채우는 것이 기본이면
// 대부분의 자리에서 되돌려야 한다. 모바일 폼 아래의 제출 버튼처럼 폭을 채워야 하는 자리만
// `layout` 으로 밝힌다.
test("a button hugs its label unless the layout says otherwise", () => {
  assert.ok(!renderButton(<Button>Label</Button>).includes("w-full"), "기본 너비가 부모를 채운다")
  assert.ok(renderButton(<Button layout="fill">Label</Button>).split(" ").includes("w-full"), "layout=fill 이 부모를 채우지 않는다")
})
