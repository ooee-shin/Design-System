import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Chip } from "./chip"

afterEach(() => {
  cleanup()
})

function radiusClassOf(element: Element | null) {
  return element?.className.match(/rounded-\S+/)?.[0] ?? null
}

// Rounded 가 다른 컨트롤과 같은 radius 를 쓰는지는 control-radius.test.tsx 가 함께 렌더해
// 검사한다. 여기에는 Chip 하나만으로 성립하는 동작을 둔다.
test("a circle chip keeps the fully rounded pill shape", () => {
  const view = render(<Chip shape="circle">Label</Chip>)

  assert.equal(radiusClassOf(view.container.querySelector("[data-slot=chip]")), "rounded-full")
})

test("circle is the default shape when none is given", () => {
  const view = render(<Chip>Label</Chip>)

  assert.equal(radiusClassOf(view.container.querySelector("[data-slot=chip]")), "rounded-full")
})

// interaction.md 의 「공통 Control Height」에 XSmall 28px 이 있고, Chip 은 Suggestion 처럼
// 여러 항목을 훑는 자리에서 그 단계를 쓴다. 높이 값은 packages/tokens 가 소유하므로
// 여기서는 Chip 이 공통 토큰을 참조하는지만 검사한다.
test("a chip can use the extra small step from the shared height scale", () => {
  const view = render(<Chip controlSize="xsmall">Label</Chip>)
  const chip = view.container.querySelector("[data-slot=chip]")

  assert.ok(chip?.className.includes("h-oe-control-xsmall"), `공통 XSmall 토큰을 쓰지 않는다: ${chip?.className}`)
})

// XSmall 은 28px 상자에 담기므로 Label 도 한 단계 줄인다. 13px/16px 은 공용
// `text-oe-label` token 이 소유하고, 나머지 단계는 다른 컨트롤과 같은 14px 을 쓴다.
test("the extra small chip uses the smaller label token", () => {
  const view = render(<Chip controlSize="xsmall">Label</Chip>)
  const chip = view.container.querySelector("[data-slot=chip]")

  assert.ok(chip?.className.includes("text-oe-label"), `13px label token 을 쓰지 않는다: ${chip?.className}`)
  assert.ok(!chip?.className.includes("text-sm"), `14px 이 함께 남아 있다: ${chip?.className}`)
})

test("the other chip sizes keep the same label size as other controls", () => {
  for (const size of ["small", "regular", "large", "xlarge"] as const) {
    cleanup()
    const view = render(<Chip controlSize={size}>Label</Chip>)
    const chip = view.container.querySelector("[data-slot=chip]")

    assert.ok(chip?.className.includes("text-sm"), `${size} 가 14px 을 쓰지 않는다`)
  }
})

// chip.md 는 Label 이 없으면 Icon only 이며 높이와 같은 정사각 폭을 쓴다고 정한다.
// 그 폭에는 아이콘만 들어가므로 Prefix 를 함께 넘겨도 그리지 않는다. 그리면 정사각
// 안에서 글자와 아이콘이 넘쳐 Chip 이 찌그러진다.
test("an icon only chip does not draw a prefix", () => {
  const view = render(<Chip prefix="Prefix" leadingElement={<svg />} ariaLabel="Chip" />)

  assert.equal(view.container.querySelector("[data-slot=chip-prefix]"), null)
  assert.ok(view.container.querySelector("[data-slot=chip]")?.className.includes("w-oe-control-regular"))
})

test("a chip with a label still draws its prefix", () => {
  const view = render(<Chip prefix="Prefix">Label</Chip>)

  assert.equal(view.container.querySelector("[data-slot=chip-prefix]")?.textContent, "Prefix")
})

// XSmall 은 Label 을 13px 로 줄이므로 굵기도 한 단계 내린다. 작은 글자에 medium 을
// 그대로 쓰면 같은 줄의 다른 글자보다 도드라진다. 나머지 단계는 medium 을 유지한다.
test("the extra small chip thins its label weight", () => {
  const view = render(<Chip controlSize="xsmall">Label</Chip>)
  const chip = view.container.querySelector("[data-slot=chip]")

  assert.ok(chip?.className.includes("font-normal"), `font-normal 이 아니다: ${chip?.className}`)
  assert.ok(!chip?.className.includes("font-medium"), `font-medium 이 함께 남아 있다: ${chip?.className}`)
})

test("the other chip sizes keep the medium label weight", () => {
  for (const size of ["small", "regular", "large", "xlarge"] as const) {
    cleanup()
    const view = render(<Chip controlSize={size}>Label</Chip>)
    const chip = view.container.querySelector("[data-slot=chip]")

    assert.ok(chip?.className.includes("font-medium"), `${size} 가 medium 을 쓰지 않는다`)
  }
})

// chip.md 는 Chip 이 내부 콘텐츠를 감싸는 너비를 쓰되 담을 폭보다 넓어지면 Label 만
// 말줄임해 한 줄을 유지한다고 정한다. Leading·Prefix·Trailing·Remove button 이 함께
// 줄어들면 아이콘이 찌그러지거나 버튼을 누를 수 없게 되므로 그 넷은 줄어들지 않는다.
test("only the label gives way when a chip runs out of width", () => {
  const view = render(
    <Chip prefix="Prefix" leadingElement={<svg />} onRemove={() => undefined} removeLabel="삭제">
      아주 긴 Label 이 들어와도 한 줄을 유지해야 한다
    </Chip>,
  )
  const chip = view.container.querySelector("[data-slot=chip]")
  const label = view.container.querySelector("[data-slot=chip-label]")

  assert.ok(chip?.className.includes("max-w-full"), "담을 폭을 넘지 않게 제한하지 않는다")
  assert.ok(label?.className.includes("truncate"), "Label 을 말줄임하지 않는다")
  assert.ok(label?.className.includes("min-w-0"), "Label 이 줄어들 수 있게 두지 않았다")

  for (const slot of ["chip-leading-element", "chip-prefix", "chip-remove"]) {
    const part = view.container.querySelector(`[data-slot=${slot}]`)
    assert.ok(part, `${slot} 을 찾지 못했다`)
    assert.ok(part.className.includes("shrink-0"), `${slot} 이 함께 줄어든다`)
  }
})

// `iconOnly` 는 `children` 유무로 내부에서 정하므로 밖에서 넘길 수 없어야 한다. 넘길 수
// 있으면 값이 무시되는 Property 가 타입에만 남는다.
test("the type rejects forcing the icon only variant from outside", () => {
  // @ts-expect-error iconOnly 는 내부에서 정하므로 밖에서 넘길 수 없다
  const forcedIconOnly = <Chip iconOnly>Label</Chip>

  assert.ok(forcedIconOnly)
})

// 보이는 글자와 읽히는 이름이 갈리면 화면을 보며 말하는 사람과 듣는 사람이 같은 것을
// 가리키지 못한다. Label 을 담지 않은 `ariaLabel` 은 이름으로 쓰지 않는다.
test("a labelled chip is never renamed by an ariaLabel that drops the label", () => {
  for (const props of [
    { children: "Label", ariaLabel: "다른 이름" },
    { children: "Label", ariaLabel: "다른 이름", onClick: () => undefined },
    { children: "Label", ariaLabel: "다른 이름", onRemove: () => undefined, removeLabel: "삭제" },
  ] as const) {
    cleanup()
    const view = render(<Chip {...props} />)
    const chip = view.container.querySelector("[data-slot=chip]")

    assert.equal(chip?.getAttribute("aria-label"), null, `${JSON.stringify(props)} 에서 Label 이 덮어써졌다`)
  }
})

// 「2」처럼 짧은 Label 은 그 자체로 무엇을 하는 자리인지 말하지 못한다. 보이는 글자를 담은
// 이름은 그 Label 을 보태는 것이므로 받는다. 기준은 chip.md 의 「Label 을 담은 이름만 보태기」다.
test("a labelled chip takes an ariaLabel that contains its label", () => {
  for (const props of [
    { children: "2", ariaLabel: "처리상태 조건 2개 지우기" },
    { children: "2", ariaLabel: "처리상태 조건 2개 지우기", onClick: () => undefined },
    { children: "2", ariaLabel: "처리상태 조건 2개 지우기", onRemove: () => undefined, removeLabel: "삭제" },
  ] as const) {
    cleanup()
    const view = render(<Chip {...props} />)
    const chip = view.container.querySelector("[data-slot=chip]")

    assert.equal(
      chip?.getAttribute("aria-label"),
      "처리상태 조건 2개 지우기",
      `${JSON.stringify(props)} 에서 Label 을 담은 이름이 붙지 않았다`,
    )
  }
})

// chip.md 는 Icon only 에서 `ariaLabel` 이 필수라고 정한다. 타입으로 가르면 Playground 처럼
// Label 유무가 런타임에 바뀌는 호출부가 조합마다 분기를 만들어야 하므로, 개발 중 경고로
// 빠진 것을 알린다. Label 이 있는 Chip 은 그 글자가 이름이므로 경고하지 않는다.
test("an icon only chip warns when it has no accessible name", () => {
  const warnings: string[] = []
  const original = console.warn
  console.warn = (message: unknown) => { warnings.push(String(message)) }
  try {
    render(<Chip leadingElement={<svg />} />)
    cleanup()
    render(<Chip leadingElement={<svg />} ariaLabel="Chip" />)
    cleanup()
    render(<Chip leadingElement={<svg />}>Label</Chip>)
  } finally {
    console.warn = original
  }

  const chipWarnings = warnings.filter((text) => text.includes("ariaLabel"))
  assert.equal(chipWarnings.length, 1, `경고가 한 번만 나와야 한다: ${JSON.stringify(warnings)}`)
})
