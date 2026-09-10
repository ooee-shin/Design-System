import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Button } from "./button"
import { CheckboxField } from "./checkbox"
import { Input } from "./input"
import { InputButton } from "./input-button"
import { RadioField, RadioGroup } from "./radio"

afterEach(() => {
  cleanup()
})

// docs/system/interaction.md 의 「공통 너비 Layout」은 값을 세 개짜리 한 축으로 정한다. `hug` 는
// 내용 너비, `fill` 은 부모 너비, `fixed` 는 지정 너비다. 이 파일은 컴포넌트가 그 이름을 쓰는지만
// 검사한다. 예전에는 같은 축에 이름이 셋이었다. Checkbox·Radio 가 `inline | block`, Input 계열이
// `fill | fixed`, Button 이 `hug | fill` 을 썼고, 그중 `inline` 과 `block` 은 CSS `display` 값과
// 이름이 겹치는데 뜻이 달라 잘못 읽히기 쉬웠다.
function widthOf(element: Element | null) {
  const className = element?.className ?? ""
  if (className.split(" ").includes("w-full")) return "fill"
  return "hug"
}

const hugAndFill: Array<[string, (layout: "hug" | "fill") => React.ReactElement, string]> = [
  ["Button", (layout) => <Button layout={layout}>Label</Button>, "[data-slot=button]"],
  ["CheckboxField", (layout) => <CheckboxField layout={layout} label="Label" />, "label"],
  ["RadioField", (layout) => <RadioGroup><RadioField value="a" layout={layout} label="Label" /></RadioGroup>, "label"],
]

for (const [name, renderControl, selector] of hugAndFill) {
  test(`${name} names its width layout hug and fill`, () => {
    assert.equal(widthOf(render(renderControl("hug")).container.querySelector(selector)), "hug")
    cleanup()
    assert.equal(widthOf(render(renderControl("fill")).container.querySelector(selector)), "fill")
  })
}

// 한 줄 Form control 은 `hug` 를 제공하지 않는다. 입력값에 따라 외곽 너비가 달라지면 안 되기
// 때문이며, 그 판단은 input.md 가 소유한다. 대신 지정 너비인 `fixed` 를 갖는다.
// Textarea 는 `layout` 을 받지 않고 언제나 부모 너비를 채우므로 이 목록에 들어오지 않는다.
const fillAndFixed: Array<[string, (layout: "fill") => React.ReactElement, string]> = [
  ["Input", (layout) => <Input aria-label="값" layout={layout} />, "[data-slot=input-container]"],
  ["InputButton", (layout) => <InputButton value="값" layout={layout} />, "[data-slot=input-button]"],
]

for (const [name, renderControl, selector] of fillAndFixed) {
  test(`${name} keeps naming its full width layout fill`, () => {
    assert.equal(widthOf(render(renderControl("fill")).container.querySelector(selector)), "fill")
  })
}

test("no component keeps the old inline and block names", () => {
  for (const [name, renderControl] of hugAndFill) {
    const html = render(renderControl("fill")).container.innerHTML
    assert.ok(!html.includes("w-fit"), `${name} 이 fill 에서 내용 너비로 남아 있다`)
    cleanup()
  }
})
