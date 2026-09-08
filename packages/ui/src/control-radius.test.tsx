import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Chip } from "./chip"
import { Combobox } from "./combobox"
import { Input } from "./input"
import { InputButton } from "./input-button"
import { Select } from "./select"
import { Textarea } from "./textarea"

afterEach(() => {
  cleanup()
})

// docs/system/interaction.md 의 「공통 Control Radius」는 값을 입력받거나 고르는 컨트롤이
// 하나의 radius 를 공유한다고 정한다. 같은 페이지에, 때로는 같은 Field 안에 나란히 놓이는
// 요소들이므로 모서리가 몇 픽셀만 달라도 줄이 어긋나 보인다. 값은 `packages/tokens` 가
// 소유하고 여기서는 컨트롤이 그 토큰을 쓰는지만 검사한다.
const CONTROL_RADIUS = "rounded-oe-control"

function radiusClassOf(element: Element | null) {
  return element?.className.match(/rounded-\S+/)?.[0] ?? null
}

const controls: Array<[string, () => React.ReactElement, string]> = [
  ["Input", () => <Input aria-label="값" />, "[data-slot=input-container]"],
  ["Textarea", () => <Textarea aria-label="값" />, "[data-slot=textarea-container]"],
  ["Select", () => <Select ariaLabel="값" options={[{ value: "a", label: "A" }]} />, "[data-slot=select-trigger]"],
  ["Combobox", () => <Combobox ariaLabel="값" options={[{ value: "a", label: "A" }]} />, "[data-slot=combobox-trigger]"],
  ["InputButton", () => <InputButton value="값" />, "[data-slot=input-button]"],
  ["Chip", () => <Chip shape="rounded">Label</Chip>, "[data-slot=chip]"],
]

for (const [name, renderControl, selector] of controls) {
  test(`${name} uses the shared control radius`, () => {
    const view = render(renderControl())
    const element = view.container.querySelector(selector)

    assert.ok(element, `${selector} 를 찾지 못했다`)
    assert.equal(radiusClassOf(element), CONTROL_RADIUS)
  })
}
